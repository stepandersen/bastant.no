const normalize = (text) => (text ?? "").toLocaleLowerCase("nb").normalize("NFKC").replace(/[^\p{L}\p{N}]+/gu, " ").trim();

export function titleSimilarity(a, b) {
  const left = new Set(normalize(a).split(" ").filter(Boolean));
  const right = new Set(normalize(b).split(" ").filter(Boolean));
  if (!left.size || !right.size) return 0;
  return [...left].filter((word) => right.has(word)).length / new Set([...left, ...right]).size;
}

export function sameStory(a, b) {
  if (a.canonicalUrl === b.canonicalUrl) return true;
  if (!a.published || !b.published || Math.abs(Date.parse(a.published) - Date.parse(b.published)) > 18 * 3600000) return false;
  const titleA = normalize(a.title), titleB = normalize(b.title);
  if (Math.min(titleA.split(" ").length, titleB.split(" ").length) < 6) return false;
  // Conflicting numbers/negations commonly signal different claims, despite similar words.
  const numbers = (title) => [...title.matchAll(/\d+/g)].map((m) => m[0]).sort().join(",");
  if (numbers(titleA) !== numbers(titleB) || /\b(?:ikke|aldri|ingen)\b/.test(titleA) !== /\b(?:ikke|aldri|ingen)\b/.test(titleB)) return false;
  const title = titleSimilarity(titleA, titleB);
  const description = titleSimilarity(a.description, b.description);
  const credited = Boolean(a.producer && b.producer && a.producer.toLowerCase() === b.producer.toLowerCase());
  // Require corroborating descriptions or explicit common credit even for equal titles.
  return (title >= 0.9 && description >= 0.8) || (titleA === titleB && credited && description >= 0.6);
}

export function clusterArticles(articles) {
  const clusters = [];
  for (const article of [...articles].sort((a, b) => a.discoveredAt.localeCompare(b.discoveredAt) || a.id.localeCompare(b.id))) {
    // Complete-link prevents A≈B≈C from merging A and C without direct similarity.
    const cluster = clusters.find((group) => group.every((other) => sameStory(article, other)));
    if (cluster) cluster.push(article); else clusters.push([article]);
  }
  return clusters.map((articles) => ({ id: articles[0].id, articles }));
}
