import discovery from "./sourceDiscovery.js";
import { defaults } from "./config.js";
import { clusterArticles } from "./clusterArticles.js";
import { assessCandidate } from "./assessCandidate.js";
import { applyEditorialPriority } from "./editorialPriority.js";

export function aiAllowed(article) {
  // VG syndicates E24 items with explicit E24 section credit. Do not route them around the E24 setting.
  const source = article.section?.toLowerCase() === "e24" || article.producer?.toLowerCase() === "e24" ? "e24" : article.publisher;
  return discovery[article.publisher]?.enabled === true && discovery[source]?.aiEnabled === true;
}

export function candidateGroups(inbox) {
  return clusterArticles(inbox.articles.filter((a) => !a.decision));
}

export async function assessInbox(inbox, { publisher, maxAiCandidates = defaults.maxAiCandidates, settings, assess = assessCandidate, save = async () => {}, log = console.log }) {
  const groups = candidateGroups(inbox).map((group) => ({ ...group,
    eligible: group.articles.filter((a) => aiAllowed(a) && (!publisher || a.publisher === publisher)),
  })).filter((g) => g.eligible.length);
  const representative = (group) => [...group.eligible].sort((a, b) => b.prefilterScore - a.prefilterScore || (b.description?.length ?? 0) - (a.description?.length ?? 0) || a.id.localeCompare(b.id))[0];
  groups.sort((a, b) => representative(b).prefilterScore - representative(a).prefilterScore || representative(b).discoveredAt.localeCompare(representative(a).discoveredAt));
  let assessed = 0, failed = 0, reused = 0;
  for (const group of groups) {
    const pending = group.eligible.filter((a) => !a.assessment);
    if (!pending.length) continue;
    const existing = group.eligible.find((a) => a.assessment);
    if (existing) {
      for (const article of pending) Object.assign(article, { assessment: existing.assessment, status: "assessed", assessmentError: null });
      reused += pending.length; await save(); continue;
    }
    const article = representative(group);
    if (article.prefilterScore < defaults.prefilterThreshold || assessed + failed >= maxAiCandidates) continue;
    for (const entry of pending) entry.attempts = (entry.attempts ?? 0) + 1;
    try {
      const assessment = applyEditorialPriority(await assess(article, settings), article);
      for (const entry of pending) Object.assign(entry, { assessment, status: "assessed", assessmentError: null });
      assessed++; log(`AI: ${assessed + failed}/${maxAiCandidates} – ${assessment.score}/100`);
    } catch (error) {
      failed++;
      for (const entry of pending) Object.assign(entry, { status: "failed", assessmentError: { kind: error.kind ?? "ai", message: error.message, at: new Date().toISOString() } });
      log(`AI: ${error.kind ?? "ai"} – ${error.message}`);
      await save();
      if (error.fatal) break;
      continue;
    }
    await save();
  }
  return { assessed, failed, reused };
}
