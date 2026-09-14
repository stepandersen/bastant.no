import { XMLParser, XMLValidator } from "fast-xml-parser";
import { list, value } from "./normalizeArticle.js";

export class RadarError extends Error {
  constructor(kind, message) { super(message); this.kind = kind; }
}

export function parseFeed(xml, type = "rss") {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new RadarError("invalid-feed", "DOCTYPE/ENTITY støttes ikke");
  const valid = XMLValidator.validate(xml);
  if (valid !== true) throw new RadarError("parser", "XML kunne ikke parses");
  let doc;
  try { doc = new XMLParser({ ignoreAttributes: false, parseTagValue: false, trimValues: true }).parse(xml); }
  catch { throw new RadarError("parser", "XML kunne ikke parses"); }
  if (type === "sitemap") {
    if (!doc.urlset) throw new RadarError("invalid-feed", "Forventet urlset; bruk en konkret news sitemap, ikke en indeks");
    return list(doc.urlset.url).map((item) => ({
      url: value(item.loc), title: item["news:news"]?.["news:title"],
      published: item["news:news"]?.["news:publication_date"], updated: item.lastmod,
    }));
  }
  if (doc.rss?.channel) return list(doc.rss.channel.item).map((item) => ({
    url: value(item.link) || (item.guid?.["@_isPermaLink"] !== "false" ? value(item.guid) : ""),
    title: item.title, description: item.description,
    categories: list(item.category), section: list(item.category)[0],
    authors: list(item["dc:creator"] ?? item.author),
    published: item.pubDate ?? item["dc:date"], updated: item["dcterms:modified"],
  }));
  if (doc.feed) return list(doc.feed.entry).map((item) => ({
    url: list(item.link).find((link) => !link["@_rel"] || link["@_rel"] === "alternate")?.["@_href"],
    title: item.title, description: item.summary,
    categories: list(item.category).map((c) => c["@_label"] ?? c["@_term"]),
    authors: list(item.author).map((a) => a.name), published: item.published, updated: item.updated,
  }));
  throw new RadarError("invalid-feed", "Svaret er ikke RSS eller Atom");
}
