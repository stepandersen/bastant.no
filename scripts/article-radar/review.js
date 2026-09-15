import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { createInterface, emitKeypressEvents } from "node:readline";
import { acquireLock, readInbox, saveInbox } from "./store.js";
import { rankCandidates, writeOutput } from "./writeOutput.js";
import { defaults } from "./config.js";
import sourceTypes from "../../src/_data/sourceTypes.js";

// Feed/model text must not be able to inject terminal control sequences.
const plain = (text) => String(text ?? "").replace(/[\u0000-\u001f\u007f-\u009f]/g, " ");

export function createAnswers(input, output) {
  if (!input.isTTY || typeof input.setRawMode !== "function") {
    const reader = createInterface({ input, output, terminal: false });
    reader.on("SIGINT", () => reader.close());
    return { answers: reader[Symbol.asyncIterator](), close: () => reader.close(), instant: false };
  }
  const wasRaw = Boolean(input.isRaw);
  let pending, ended = false;
  const finish = () => { ended = true; pending?.({ done: true }); pending = null; };
  const onKey = (text, key = {}) => {
    if (key.ctrl && ["c", "d"].includes(key.name)) { finish(); return; }
    // Ignore keys while saving, to avoid accidentally deciding the next candidate.
    if (!pending || key.ctrl || key.meta) return;
    const value = (text ?? "").toLowerCase();
    if (!["y", "n", "p", "q"].includes(value)) return;
    output.write(`${value}\n`);
    const resolve = pending; pending = null;
    resolve({ value, done: false });
  };
  emitKeypressEvents(input);
  input.setRawMode(true);
  input.on("keypress", onKey);
  input.on("end", finish);
  input.resume();
  return {
    instant: true,
    answers: { next: () => ended ? Promise.resolve({ done: true }) : new Promise((resolve) => { pending = resolve; }) },
    close() {
      finish(); input.removeListener("keypress", onKey); input.removeListener("end", finish);
      input.setRawMode(wasRaw); input.pause();
    },
  };
}

export async function reviewInbox(directory, { input = process.stdin, output = process.stdout } = {}) {
  const unlock = await acquireLock(directory);
  let reader;
  const counts = { selected: 0, rejected: 0, passed: 0 };
  try {
    const inbox = await readInbox(directory);
    // Snapshot the queue: pass advances once, and remains open for the next session.
    const queue = rankCandidates(inbox).filter((candidate) => candidate.assessment);
    output.write(`\nBastant – gjennomgå innboksen\n${queue.length} åpne AI-vurderte kandidater, høyeste score først.\n`);
    if (!queue.length) return counts;
    output.write("yes/y = selected · no/n = rejected · pass/p = behold åpen · quit/q = avslutt\nValg lagres fortløpende. Ingen API-kall.\n");
    reader = createAnswers(input, output);
    if (reader.instant) output.write("Trykk y / n / p / q direkte – uten Enter.\n");
    const answers = reader.answers;
    candidates: for (const [index, candidate] of queue.entries()) {
      output.write(`\n${index + 1}/${queue.length} · ${candidate.assessment.score}/100 · ${candidate.publishers.map((key) => plain(sourceTypes[key]?.name ?? key)).join(", ")}\n${plain(candidate.title)}\nPublisert: ${plain(candidate.published ?? "Ukjent")}\nID: ${candidate.id}\n`);
      if (candidate.description) output.write(`${plain(candidate.description)}\n`);
      for (const article of candidate.articles) output.write(`${plain(article.url)}\n`);
      if (candidate.assessment.editorialPriority) output.write(`Redaksjonell prioritering: ${plain(candidate.assessment.editorialPriority.reason)}\n`);
      for (const reason of candidate.assessment.reasons ?? []) output.write(`- ${plain(reason)}\n`);
      for (;;) {
        output.write(reader.instant ? "\ny / n / p / q > " : "\nyes / no / pass / quit > ");
        const answer = await answers.next();
        if (answer.done) break candidates;
        const choice = answer.value.trim().toLowerCase();
        if (["quit", "q"].includes(choice)) break candidates;
        if (["pass", "p"].includes(choice)) { counts.passed++; break; }
        const decision = ["yes", "y"].includes(choice) ? "selected" : ["no", "n"].includes(choice) ? "rejected" : null;
        if (!decision) { output.write("Skriv yes, no, pass eller quit. Tomt svar gjør ingen endring.\n"); continue; }
        const now = new Date().toISOString();
        const ids = new Set(candidate.articles.map((article) => article.id));
        for (const article of inbox.articles.filter((article) => ids.has(article.id))) {
          Object.assign(article, { decision, decisionAt: now, decisionGroupId: candidate.id, rejectionReason: null });
        }
        inbox.lastReview = { at: now, candidateId: candidate.id, decision };
        await saveInbox(directory, inbox);
        await writeOutput(directory, inbox, {
          at: now, mode: "review", fetched: 0, added: 0, assessed: 0, failed: 0, errors: [],
          prefilterPassed: inbox.articles.filter((a) => !a.decision && a.prefilterScore >= defaults.prefilterThreshold).length,
        }, defaults.reportLimit);
        counts[decision]++;
        output.write(`Lagret: ${decision}.\n`);
        break;
      }
    }
    output.write(`\nFerdig: ${counts.selected} selected · ${counts.rejected} rejected · ${counts.passed} pass.\n`);
    return counts;
  } finally {
    reader?.close();
    await unlock();
  }
}

export async function main(args = process.argv.slice(2)) {
  const { values } = parseArgs({ args, options: { "data-dir": { type: "string" }, help: { type: "boolean" } } });
  if (values.help) {
    console.log("npm run article-radar:review [-- --data-dir=PATH]\nGjennomgå alle åpne AI-vurderte kandidater med yes/no/pass. quit avslutter.");
    return;
  }
  const directory = path.resolve(values["data-dir"] ?? process.env.ARTICLE_RADAR_DATA_DIR ?? fileURLToPath(new URL("../../data/article-radar/", import.meta.url)));
  await reviewInbox(directory);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(`Artikkelradar: ${error.message}`); process.exitCode = 1; });
}
