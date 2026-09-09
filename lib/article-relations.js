// A relation describes the reviewed publications, not Bastant's own response.
export function relatedArticles(articles, slug) {
  const published = (articles || []).filter(article => article.data.status !== "draft" && article.url);
  const current = published.find(article => article.fileSlug === slug);
  if (!current) return [];
  return published
    .filter(article => article.fileSlug !== slug && (
      current.data.respondsTo === article.fileSlug || article.data.respondsTo === slug
    ))
    .map(article => ({
      title: article.data.title,
      url: article.url,
      description: current.data.respondsTo === article.fileSlug
        ? "Innlegget vi gjennomgår her, er et tilsvar til originalinnlegget i denne gjennomgangen."
        : "Originalinnlegget i denne gjennomgangen er et tilsvar til innlegget vi gjennomgår her.",
    }));
}
