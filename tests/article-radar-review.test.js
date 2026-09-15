import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable, Writable, PassThrough } from "node:stream";
import { reviewInbox, createAnswers } from "../scripts/article-radar/review.js";
import { saveInbox, readInbox, acquireLock } from "../scripts/article-radar/store.js";

async function setup(t) {
  const dir = await mkdtemp(path.join(tmpdir(), "bastant-review-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const article = (id, score, extra = {}) => ({ id, title: `Sak ${id}`, canonicalUrl: `https://www.nrk.no/${id}`, url: `https://www.nrk.no/${id}`, publisher: "nrk", discoveredAt: "2026-09-15T00:00:00Z", published: "2026-09-15T00:00:00Z", prefilterScore: 5, decision: null, assessment: score === null ? null : { score, reasons: ["Begrunnelse"], researchQuestions: [], likelyPrimarySources: [], limitations: [] }, ...extra });
  await saveInbox(dir, { version: 1, articles: [article("a", 90), article("b", 80), article("c", 70), article("d", null), article("e", 99, { decision: "selected" })] });
  return dir;
}

test("hurtigtaster krever ikke Enter og råmodus gjenopprettes ved avslutning", async () => {
  const input = new PassThrough(); input.isTTY = true; input.isRaw = false;
  input.setRawMode = (value) => { input.isRaw = value; };
  const output = new Writable({ write(chunk, encoding, callback) { callback(); } });
  const reader = createAnswers(input, output);
  try {
    assert.equal(input.isRaw, true);
    for (const value of ["y", "n", "p", "q"]) {
      const answer = reader.answers.next();
      input.write(value);
      assert.deepEqual(await answer, { value, done: false });
    }
    const stopped = reader.answers.next(); input.write("\u0003");
    assert.deepEqual(await stopped, { done: true });
  } finally { reader.close(); input.destroy(); output.destroy(); }
  assert.equal(input.isRaw, false);
  assert.equal(input.listenerCount("keypress"), 0);
});
async function run(dir, answers) {
  let text = "";
  const result = await reviewInbox(dir, { input: Readable.from(answers), output: new Writable({ write(chunk, encoding, callback) { text += chunk.toString(); callback(); } }) });
  return { result, text };
}

test("review lagrer yes/no, lar pass være åpen og hopper over uvurderte/avgjorte", async (t) => {
  const dir = await setup(t);
  const { result, text } = await run(dir, ["\ninvalid\nyes\nno\npass\n"]);
  assert.deepEqual(result, { selected: 1, rejected: 1, passed: 1 });
  assert.ok(text.indexOf("Sak a") < text.indexOf("Sak b"));
  assert.ok(!text.includes("Sak d") && !text.includes("Sak e"));
  const inbox = await readInbox(dir);
  assert.deepEqual(inbox.articles.map((a) => a.decision), ["selected", "rejected", null, null, "selected"]);
  const report = JSON.parse(await readFile(path.join(dir, "candidates.json")));
  assert.deepEqual(report.candidates.map((a) => a.id), ["c", "d"]);
  const second = await run(dir, ["q\n"]);
  assert.ok(second.text.includes("Sak c") && !second.text.includes("Sak a"));
  const unlock = await acquireLock(dir); await unlock();
});

test("EOF bevarer tidligere valg og frigir låsen", async (t) => {
  const dir = await setup(t);
  await run(dir, ["y\n"]);
  const inbox = await readInbox(dir);
  assert.equal(inbox.articles[0].decision, "selected");
  assert.equal(inbox.articles[1].decision, null);
  const unlock = await acquireLock(dir); await unlock();
});

test("beslutning gjelder hele kandidatgruppen og tom kø trenger ikke input", async (t) => {
  const dir = await setup(t);
  const inbox = await readInbox(dir);
  const a = { ...inbox.articles[0], title: "Nye regler øker skatten for mange ansatte", description: "Regelendringen gjelder mange ansatte i hele landet." };
  const b = { ...a, id: "duplicate", url: "https://www.vg.no/b", canonicalUrl: "https://www.vg.no/b", publisher: "vg" };
  inbox.articles = [a, b]; await saveInbox(dir, inbox);
  await run(dir, ["n\n"]);
  assert.ok((await readInbox(dir)).articles.every((a) => a.decision === "rejected"));
  const empty = await run(dir, []);
  assert.match(empty.text, /0 åpne AI-vurderte/);
});
