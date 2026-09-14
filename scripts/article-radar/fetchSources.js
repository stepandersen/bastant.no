import sourceTypes from "../../src/_data/sourceTypes.js";
import discoveryConfig from "./sourceDiscovery.js";
import { parseFeed, RadarError } from "./parseFeed.js";
import { normalizeArticle } from "./normalizeArticle.js";

export async function fetchSources({ publisher, sinceHours, now = new Date().toISOString(), fetchImpl = fetch, log = console.log, config = discoveryConfig }) {
  const articles = [], errors = [];
  let successfulFeeds = 0, attemptedFeeds = 0, skipped = 0;
  for (const [key, source] of Object.entries(config)) {
    if (!source.enabled || (publisher && key !== publisher) || !sourceTypes[key]?.roles?.includes("publisher")) continue;
    let count = 0;
    for (const feed of source.feeds.filter((f) => f.enabled !== false)) {
      attemptedFeeds++;
      try {
        let response, xml;
        try {
          response = await fetchImpl(feed.url, { headers: { "User-Agent": "BastantArticleRadar/1.0 (+https://bastant.no)" }, signal: AbortSignal.timeout(20000) });
          if (!response.ok) throw new RadarError("network", `HTTP ${response.status}`);
          const chunks = []; let bytes = 0;
          for await (const chunk of response.body) {
            bytes += chunk.length;
            if (bytes > 5_000_000) throw new RadarError("invalid-feed", "Feed er større enn 5 MB");
            chunks.push(chunk);
          }
          xml = Buffer.concat(chunks).toString("utf8");
        } catch (error) { throw error instanceof RadarError ? error : new RadarError("network", "Nettverksfeil eller tidsavbrudd"); }
        const items = parseFeed(xml, feed.type);
        successfulFeeds++;
        for (const raw of items) {
          try {
            if (!raw.url) throw new Error("URL mangler");
            const article = normalizeArticle(raw, key, { type: feed.type, source: feed.url }, now);
            const host = new URL(article.url).hostname;
            if (host !== sourceTypes[key].site && !host.endsWith(`.${sourceTypes[key].site}`)) { skipped++; continue; }
            const published = article.published && Date.parse(article.published);
            if (published && (published < Date.parse(now) - sinceHours * 3600000 || published > Date.parse(now) + 300000)) { skipped++; continue; }
            articles.push(article); count++;
          } catch { skipped++; }
        }
      } catch (error) {
        const item = { publisher: key, source: feed.url, kind: error.kind ?? "parser", message: error.message };
        errors.push(item); log(`  ${sourceTypes[key].name}: ${item.kind} – ${item.message}`);
      }
    }
    log(`${sourceTypes[key].name.padEnd(20, ".")} ${count}`);
  }
  return { articles, errors, successfulFeeds, attemptedFeeds, skipped };
}
