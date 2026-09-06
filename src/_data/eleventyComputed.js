export default {
  pageTitle: (data) => data.title ? `${data.title} – ${data.site.name}` : data.site.name,
  metaDescription: (data) => data.summary || data.site.description,
};
