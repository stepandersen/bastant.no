export default {
  eleventyComputed: {
    layout: (data) => data.status === "draft" ? false : "layouts/article.njk",
    permalink: (data) =>
      data.status === "draft" ? false : `/artikler/${data.page.fileSlug}/index.html`,
    eleventyExcludeFromCollections: (data) => data.status === "draft",
  },
};
