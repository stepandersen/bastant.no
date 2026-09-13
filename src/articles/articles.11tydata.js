export default {
  eleventyComputed: {
    layout: () => "layouts/article.njk",
    permalink: (data) =>
      `/${data.status === "draft" ? "utkast" : "artikler"}/${data.page.fileSlug}/index.html`,
    noindex: (data) => data.status === "draft",
  },
};
