import { editorialPriority } from "./editorialPriority.js";
// Signals indicate opportunities for verification, never suspected error.
export const rules = [
  { name: "samfunn", weight: 2, pattern: /politikk|regjering|storting|lov(?:en|er|verk)?\b|regler|offentlig|økonomi|skatt|arbeidsliv|innvandring|kriminal|helse|sykehus|forskning|klima|energi|forsvar|krig|utenriks|statistikk|budsjett|valg|rente|inflasjon|domstol|befolkning/iu },
  { name: "sammenligning", weight: 2, pattern: /første gang|fyrste gong|størst|(?<!\p{L})minst|rekord|aldri før|(?:siden|sidan) (?:19|20)\d{2}|doblet|dobla|halvert/iu },
  { name: "tall", weight: 2, pattern: /(?<![\p{L}\p{N}])\d|prosent|milliard(?:er|ar)?|million(?:er|ar)?|tusen|økt med|auka med|falt med/iu },
  { name: "årsak eller regler", weight: 2, pattern: /fører til|skyldes|på grunn av|forskning viser|eksperter mener|nye regler|kan straffes|forbud|lovendring/iu },
  { name: "underholdning og resultater", weight: -2, pattern: /sportsresultat|fotball|håndball|kjendis|anmeldelse|tv-program|premier league|skal vi danse|kjærlighetsbrudd/iu },
  { name: "live", weight: -2, pattern: /\blive\b|følg (?:kampen|kamp|direkte)|direkteoppdatering/iu },
];

export function prefilter(article) {
  const text = [article.title, article.description, article.section, ...(article.categories ?? [])].filter(Boolean).join(" ")
    .replace(/\bTV\s*2\b/giu, "TV");
  const signals = rules.filter((rule) => rule.pattern.test(text));
  const priority = editorialPriority(article);
  if (priority) signals.push({ name: priority.reason, weight: -priority.penalty });
  return { score: Math.max(0, Math.min(10, 1 + signals.reduce((sum, rule) => sum + rule.weight, 0))), signals: signals.map(({ name, weight }) => ({ name, weight })) };
}
