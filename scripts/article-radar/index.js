import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { defaults } from "./config.js";
import sourceTypes from "../../src/_data/sourceTypes.js";
import { fetchSources } from "./fetchSources.js";
import { acquireLock, readInbox, mergeArticles, pruneInbox, saveInbox } from "./store.js";
import { assessInbox, candidateGroups } from "./pipeline.js";
import { loadAiSettings, loadPrompt } from "./assessCandidate.js";
import { writeOutput } from "./writeOutput.js";

const help = `Bastant artikkelradar
npm run article-radar                         Hent og vurder innboksen
npm run article-radar:collect                 Hent uten AI
npm run article-radar:assess                  Vurder lagret innboks uten innhenting

--no-ai                    Hent og skriv rapport uten AI eller API-nøkkel
--publisher=nrk            Begrens innhenting/vurdering (rapporten viser hele innboksen)
--since-hours=48           Publiseringsvindu ved innhenting, 1–2160 timer
--max-ai-candidates=25     Maksimalt antall nye gruppevurderinger, 1–100
--limit=15                 Antall kandidater i Markdown; JSON inneholder alle åpne
--data-dir=PATH            Alternativ innboksmappe
--decision=selected|rejected|open --id=ID [--reason=tekst]
                           Endre innboksbeslutning uten nettverkskall
--help                     Vis hjelp

Nøkkel: OPENAI_API_KEY eller ~/.config/bastant/article-radar.env utenfor repoet.
Se docs/article-radar.md.`;

export function options(args) {
  const { values } = parseArgs({ args, options: Object.fromEntries([
    ...["no-ai", "collect-only", "assess-only", "help"].map((key) => [key, { type: "boolean" }]),
    ...["publisher", "since-hours", "max-ai-candidates", "limit", "data-dir", "decision", "id", "reason"].map((key) => [key, { type: "string" }]),
  ]) });
  const number = (key, fallback, max) => {
    const raw = values[key];
    const result = raw === undefined ? fallback : Number(raw);
    if (!Number.isInteger(result) || result < 1 || result > max) throw new Error(`Ugyldig --${key}; bruk et heltall mellom 1 og ${max}`);
    return result;
  };
  if (values.publisher && !sourceTypes[values.publisher]?.roles?.includes("publisher")) throw new Error("Ukjent publisist");
  if (values["assess-only"] && (values["collect-only"] || values["no-ai"])) throw new Error("--assess-only kan ikke kombineres med --no-ai/--collect-only");
  if (values.decision && (!["selected", "rejected", "open"].includes(values.decision) || !values.id)) throw new Error("Beslutning krever --id og selected, rejected eller open");
  if ((values.id || values.reason) && !values.decision) throw new Error("--id/--reason krever --decision");
  return { ...values, sinceHours: number("since-hours", defaults.sinceHours, 2160), maxAiCandidates: number("max-ai-candidates", defaults.maxAiCandidates, 100), limit: number("limit", defaults.reportLimit, 1000) };
}

export async function main(args = process.argv.slice(2)) {
  const opts = options(args);
  if (opts.help) { console.log(help); return; }
  const directory = path.resolve(opts["data-dir"] ?? process.env.ARTICLE_RADAR_DATA_DIR ?? fileURLToPath(new URL("../../data/article-radar/", import.meta.url)));
  const unlock = await acquireLock(directory);
  try {
    console.log("Bastant artikkelradar\n");
    const inbox = await readInbox(directory);
    const run = { at: new Date().toISOString(), errors: [], fetched: 0, added: 0, assessed: 0, failed: 0 };
    if (opts.decision) {
      const group = candidateGroups(inbox).find((g) => g.id === opts.id);
      const targets = group?.articles ?? inbox.articles.filter((a) => a.id === opts.id || a.decisionGroupId === opts.id);
      if (!targets.length) throw new Error("Fant ikke kandidat-ID i innboksen");
      for (const article of targets) {
        article.decision = opts.decision === "open" ? null : opts.decision;
        article.rejectionReason = opts.decision === "rejected" ? opts.reason ?? null : null;
        article.decisionAt = run.at;
        article.decisionGroupId = opts.id;
      }
    } else {
      run.pruned = pruneInbox(inbox, run.at);
      if (!opts["assess-only"]) {
        const fetched = await fetchSources({ publisher: opts.publisher, sinceHours: opts.sinceHours, now: run.at });
        run.fetched = fetched.articles.length; run.errors = fetched.errors;
        run.successfulFeeds = fetched.successfulFeeds; run.skipped = fetched.skipped;
        run.added = mergeArticles(inbox, fetched.articles);
        if (!fetched.successfulFeeds) {
          run.errors.push({ kind: "collection", message: "Ingen kilder kunne hentes." });
          process.exitCode = 1;
        }
      } else mergeArticles(inbox, []);
      // Checkpoint collection before any key loading or model call.
      await saveInbox(directory, inbox);
      if (!opts["no-ai"] && !opts["collect-only"]) {
        try {
          const settings = { ...await loadAiSettings(), prompt: await loadPrompt() };
          if (!settings.apiKey) throw new Error("OPENAI_API_KEY mangler. Innboksen er lagret; legg inn nøkkel utenfor repoet og kjør article-radar:assess.");
          Object.assign(run, await assessInbox(inbox, { publisher: opts.publisher, maxAiCandidates: opts.maxAiCandidates, settings, save: () => saveInbox(directory, inbox) }));
          if (run.failed) process.exitCode = 1;
        } catch (error) { run.errors.push({ kind: "ai-config", message: error.message }); console.error(error.message); process.exitCode = 1; }
      }
    }
    run.prefilterPassed = inbox.articles.filter((a) => !a.decision && a.prefilterScore >= defaults.prefilterThreshold).length;
    inbox.lastRun = run;
    await saveInbox(directory, inbox);
    const candidates = await writeOutput(directory, inbox, run, opts.limit);
    console.log(`\n${run.fetched} hentet · ${run.added} nye · ${run.prefilterPassed} over forhåndsterskel\n${run.assessed} AI-vurdert · ${candidates.length} åpne kandidater\n\nResultater: ${directory}\n  inbox.json · seen.json · candidates.json · latest.md`);
  } finally { await unlock(); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(`Artikkelradar: ${error.message}`); process.exitCode = 1; });
}
