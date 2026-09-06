import pluginRss from "@11ty/eleventy-plugin-rss";
import { DateTime } from "luxon";
import sourceTypes from "./src/_data/sourceTypes.js";

const STATUS_LABELS = {
  documented: "Godt dokumentert",
  context: "Trenger kontekst",
  misleading: "Misvisende",
  unsupported: "Ikke dokumentert",
  incorrect: "Faktafeil",
  unresolved: "Uavklart",
};

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.svg": "favicon.svg" });
  eleventyConfig.addWatchTarget("src/assets");

  eleventyConfig.addFilter("readableDate", (date) =>
    DateTime.fromJSDate(new Date(date), { zone: "utc" })
      .setLocale("nb")
      .toFormat("d. LLLL yyyy")
  );
  eleventyConfig.addFilter("htmlDate", (date) =>
    DateTime.fromJSDate(new Date(date), { zone: "utc" }).toISODate()
  );
  eleventyConfig.addFilter("limit", (items, count) => (items || []).slice(0, count));
  eleventyConfig.addFilter("statusLabel", (status) => STATUS_LABELS[status] || status);
  eleventyConfig.addFilter("sourceName", (review) => {
    if (!review) return "";
    if (review.source && sourceTypes[review.source]) return sourceTypes[review.source].site;
    if (review.site) return review.site;
    try {
      return new URL(review.url).hostname.replace(/^www\./, "");
    } catch {
      return review.publisher || "";
    }
  });
  eleventyConfig.addFilter("sourceDetails", (review) => {
    const source = sourceTypes[review.source];
    return { ...source, type: source.types[review.type] };
  });
  eleventyConfig.addFilter("articlesForTopic", (articles, topic) =>
    (articles || []).filter((article) => (article.data.topics || []).includes(topic))
  );
  eleventyConfig.addFilter("topicUrl", (topic) => `/emner/${eleventyConfig.getFilter("slugify")(topic)}/`);
  eleventyConfig.addFilter("absoluteUrl", (url, base) => new URL(url, base).toString());

  eleventyConfig.addPairedShortcode("observation", (content, status, title = "") => {
    const label = STATUS_LABELS[status] || status;
    return `<aside class="observation observation--${status}">
      <p class="observation__label">${label}</p>
      ${title ? `<h3>${title}</h3>` : ""}
      <div class="observation__content">${content}</div>
    </aside>`;
  });

  eleventyConfig.addPairedShortcode("background", (content, title) => `
    <details class="background-note">
      <summary>
        <span>
          <span class="background-note__label">Bakgrunn</span>
          <span class="background-note__title">${title}</span>
        </span>
        <span class="background-note__indicator" aria-hidden="true"></span>
      </summary>
      <div class="background-note__content">${content}</div>
    </details>`);

  eleventyConfig.addCollection("articles", (collectionApi) => {
    const allArticles = collectionApi.getFilteredByGlob("src/articles/*.md");
    for (const article of allArticles) {
      const review = article.data.review;
      if (!review) continue;
      const source = sourceTypes[review.source];
      if (!source) throw new Error(`${article.inputPath}: Ukjent review.source «${review.source}».`);
      if (!source.types[review.type]) throw new Error(`${article.inputPath}: Ukjent review.type «${review.type}» for ${review.source}.`);
    }
    return allArticles
      .filter((item) => item.data.status !== "draft")
      .sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addCollection("topicList", (collectionApi) => {
    const topics = new Set();
    collectionApi.getFilteredByGlob("src/articles/*.md").forEach((item) => {
      if (item.data.status !== "draft") {
        (item.data.topics || []).forEach((topic) => topics.add(topic));
      }
    });
    return [...topics].sort((a, b) => a.localeCompare(b, "nb"));
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk", "html"],
  };
}
