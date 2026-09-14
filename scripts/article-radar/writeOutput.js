import path from "node:path";
import sourceTypes from "../../src/_data/sourceTypes.js";
import discovery from "./sourceDiscovery.js";
import { metadataLimitation, defaults } from "./config.js";
import { candidateGroups, aiAllowed } from "./pipeline.js";
import { atomicWrite } from "./store.js";

export function rankCandidates(inbox) {
  return candidateGroups(inbox).map((group) => {
    const representative = [...group.articles].sort((a, b) => Number(Boolean(b.assessment)) - Number(Boolean(a.assessment)) || b.prefilterScore - a.prefilterScore || a.id.localeCompare(b.id))[0];
    return { ...representative, id: group.id, clusterId: group.articles.length > 1 ? group.id : null,
      publishers: [...new Set(group.articles.map((a) => a.publisher))], articles: group.articles,
      aiEligible: group.articles.some(aiAllowed),
    };
  }).sort((a, b) => (b.assessment?.score ?? -1) - (a.assessment?.score ?? -1) || b.prefilterScore - a.prefilterScore || b.discoveredAt.localeCompare(a.discoveredAt) || a.id.localeCompare(b.id));
}

export const escapeMarkdown = (text) => String(text ?? "").replace(/[\r\n]+/g, " ").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/([\\`*_{}\[\]()#!|])/g, "\\$1");
const name = (key) => sourceTypes[key]?.name ?? key;
const safeLink = (url) => new URL(url).href.replace(/[<>\s]/g, (c) => encodeURIComponent(c));

export function renderMarkdown(candidates, run, limit = defaults.reportLimit) {
  const lines = ["# Bastant artikkelradar", "", `Kjørt: ${run.at}`, "",
    `Hentet ${run.fetched ?? 0} artikler; ${run.added ?? 0} nye. ${run.prefilterPassed ?? 0} artikler i innboksen passerer forhåndsfilteret.`,
    `AI-vurdert i denne kjøringen: ${run.assessed ?? 0}. AI-feil: ${run.failed ?? 0}.`,
    `${candidates.length} åpne kandidater i innboksen. Viser inntil ${limit}; tidligere vurderinger beholdes.`, "",
    "En høy score betyr at saken ser interessant og etterprøvbar ut. Den betyr ikke at artikkelen sannsynligvis er feil.", "",
    metadataLimitation, "",
  ];
  for (const error of run.errors ?? []) lines.push(`- Kjørefeil: ${escapeMarkdown(error.kind)} – ${escapeMarkdown(error.message)}`);
  candidates.slice(0, limit).forEach((candidate, index) => {
    const assessment = candidate.assessment;
    lines.push("", `## ${index + 1}. ${assessment ? `${assessment.score}/100` : "Ikke AI-vurdert"} – ${candidate.publishers.map(name).join(", ")}`, "",
      `### ${escapeMarkdown(candidate.title)}`, "", `ID: \`${candidate.id}\``, "",
      `Publisert: ${candidate.published ?? "Ukjent"} · Tilgang: bare metadata`, "");
    if (candidate.description) lines.push(escapeMarkdown(candidate.description), "");
    else lines.push("Ingress mangler. Bare tittel og øvrige metadata er tilgjengelige.", "");
    for (const article of candidate.articles) lines.push(`- [${name(article.publisher)} – original](<${safeLink(article.url)}>)`);
    lines.push("", `Lokalt forhåndssignal: ${candidate.prefilterScore}/10 (ikke en AI-score).`);
    if (assessment) {
      lines.push("", `Trygghet i kandidatseleksjonen: ${assessment.confidence}.`, "", "**Hvorfor aktuell**", "",
        ...assessment.reasons.map((s) => `- ${escapeMarkdown(s)}`), "", "**Undersøk særlig**", "",
        ...assessment.researchQuestions.map((s, i) => `${i + 1}. ${escapeMarkdown(s)}`), "", "**Mulige primærkilder – ikke kontrollert**", "",
        ...assessment.likelyPrimarySources.map((s) => `- ${escapeMarkdown(s)}`), "", "**Begrensninger**", "",
        ...assessment.limitations.map((s) => `- ${escapeMarkdown(s)}`));
    } else {
      lines.push("", candidate.aiEligible ? "Venter på AI-vurdering eller nytt forsøk. Også kandidater under forhåndsterskelen beholdes i innboksen." : "AI-vurdering er deaktivert for denne kilden.", "", metadataLimitation);
    }
  });
  const disabled = Object.entries(discovery).filter(([, source]) => !source.aiEnabled || !source.enabled);
  if (disabled.length) lines.push("", "## Kildebegrensninger", "", ...disabled.map(([key, source]) => `- ${name(key)}: ${source.aiDisabledReason ?? "Innhenting deaktivert."}`));
  return lines.join("\n") + "\n";
}

export async function writeOutput(directory, inbox, run, limit) {
  const candidates = rankCandidates(inbox);
  const seen = Object.fromEntries(inbox.articles.map((a) => [a.canonicalUrl, { firstSeen: a.discoveredAt, publisher: a.publisher, status: a.status, decision: a.decision }]));
  await atomicWrite(path.join(directory, "seen.json"), JSON.stringify(seen, null, 2) + "\n");
  await atomicWrite(path.join(directory, "candidates.json"), JSON.stringify({ version: 1, run, candidates }, null, 2) + "\n");
  await atomicWrite(path.join(directory, "latest.md"), renderMarkdown(candidates, run, limit));
  return candidates;
}
