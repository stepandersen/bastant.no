import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { normalizeArticle, normalizeUrl } from "../scripts/article-radar/normalizeArticle.js";
import { parseFeed } from "../scripts/article-radar/parseFeed.js";
import { prefilter } from "../scripts/article-radar/prefilter.js";
import { clusterArticles, sameStory } from "../scripts/article-radar/clusterArticles.js";
import { acquireLock, readInbox, saveInbox, mergeArticles, pruneInbox } from "../scripts/article-radar/store.js";
import { assessCandidate, loadAiSettings, scoreAssessment, validateAssessment } from "../scripts/article-radar/assessCandidate.js";
import { assessInbox, aiAllowed } from "../scripts/article-radar/pipeline.js";
import { renderMarkdown, rankCandidates, writeOutput } from "../scripts/article-radar/writeOutput.js";
import { fetchSources } from "../scripts/article-radar/fetchSources.js";
import { options } from "../scripts/article-radar/index.js";
import { editorialPriority, applyEditorialPriority } from "../scripts/article-radar/editorialPriority.js";

const now = "2026-09-14T08:00:00.000Z";
const article = (id, extra = {}) => normalizeArticle({ url: `https://www.nrk.no/${id}`, title: "Nye regler fører til økt skatt for tusen ansatte", description: "Offentlig statistikk viser at skatten har økt med 20 prosent.", published: now, ...extra }, "nrk", { type: "rss", source: "https://www.nrk.no/toppsaker.rss" }, now);
const assessment = () => ({ confidence: "medium", dimensions: { verifiability: 9, importance: 7, sourceAvailability: 9, contextPotential: 8, factualDensity: 8 }, reasons: ["Temaet egner seg for å undersøke skattereglene."], researchQuestions: ["Hva er kilden til tallet?", "Hva innebærer regelendringen?"], likelyPrimarySources: ["Lovtekst"], limitations: ["Bare metadata er tilgjengelige."] });
const silent = () => {};
test("pasienthistorier, trafikkhendelser og værvarsler får lav prioritet, med systemunntak", () => {
  const cases = [
    { title: "Må betale 140.000 i måneden for medisin: –Man føler seg liten og ubetydelig", description: "Heidi (39) forteller om sykdommen sin.", cap: 25 },
    { title: "Fem biler i trafikkulykke på E18 – veien delvis stengt", cap: 20 },
    { title: "Uværet nærmer seg: Varsler vindkast mot 33 m/s, lyn og høye bølger", cap: 20 },
  ];
  for (const item of cases) {
    assert.ok(prefilter(item).score < 3);
    const adjusted = applyEditorialPriority({ score: 80 }, item);
    assert.equal(adjusted.score, item.cap); assert.equal(adjusted.baseScore, 80);
    assert.deepEqual(applyEditorialPriority(adjusted, item), adjusted);
    assert.equal(applyEditorialPriority({ score: 10 }, item).score, 10);
    const ranked = rankCandidates({ articles: [{ ...article("scope", { title: item.title, description: item.description ?? null }), assessment: { score: 80 }, prefilterScore: 5 }] });
    assert.equal(ranked[0].assessment.score, item.cap);
  }
  for (const title of ["Nye regler for medisin: Pasient må betale mer", "Trafikkulykker: Statistikk viser dobling", "Værvarsel: Forskning viser svikt i varslingssystemet"]) assert.equal(editorialPriority({ title }), null);
});
async function temporary(t) {
  const directory = await mkdtemp(path.join(tmpdir(), "bastant-radar-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

test("URL-identitet fjerner tracking, men beholder artikkelparametere og fragment", () => {
  assert.equal(normalizeUrl("https://example.org/a?id=42&utm_source=x&edition=2#part"), "https://example.org/a?id=42&edition=2#part");
  assert.equal(article("one?utm_source=x").id, article("one").id);
  assert.notEqual(article("one?id=1").id, article("one?id=2").id);
  assert.throws(() => normalizeUrl("javascript:alert(1)"));
  assert.throws(() => normalizeUrl("https://user:secret@example.org/a"));
});

test("normalisering dikter ikke opp dato, ingress eller kreditering", () => {
  const item = article("one", { title: "<b>Nyhet</b>", description: null, published: "bad-date", authors: ["NTB", "Kari"], updated: "2026-09-14T10:00:00+02:00" });
  assert.equal(item.title, "Nyhet"); assert.equal(item.description, null); assert.equal(item.published, null);
  assert.equal(item.updated, now); assert.equal(item.producer, "NTB"); assert.equal(item.contentAccess, "metadata-only");
});

test("RSS, Atom og news sitemap håndterer metadata uten fulltekst", () => {
  const [rss] = parseFeed('<rss><channel><item><title>A &amp; B</title><link>https://a.no/1</link><description><![CDATA[<b>Ingress</b>]]></description><content:encoded>HEMMELIG FULLTEKST</content:encoded><media:content><media:copyright>Reuters</media:copyright></media:content><category domain="section">Helse</category></item></channel></rss>');
  assert.equal(rss.title, "A & B"); assert.equal(rss.description, "<b>Ingress</b>"); assert.equal(rss.producer, undefined);
  assert.ok(!JSON.stringify(rss).includes("FULLTEKST"));
  const [atom] = parseFeed('<feed><entry><title>Atom</title><link rel="self" href="https://a.no/api/1"/><link rel="alternate" href="https://a.no/1"/><author><name>Kari</name></author><updated>2026-09-14T08:00:00Z</updated></entry></feed>');
  assert.equal(atom.url, "https://a.no/1"); assert.deepEqual(atom.authors, ["Kari"]); assert.equal(atom.published, undefined);
  const [sitemap] = parseFeed('<urlset><url><loc>https://a.no/1</loc><lastmod>2026-09-14</lastmod><news:news><news:title>Nyhet</news:title><news:publication_date>2026-09-13</news:publication_date></news:news></url></urlset>', "sitemap");
  assert.equal(sitemap.published, "2026-09-13"); assert.equal(sitemap.description, undefined);
  assert.throws(() => parseFeed("<rss>"), { kind: "parser" });
  assert.throws(() => parseFeed("<html><body>Not RSS</body></html>"), { kind: "invalid-feed" });
  assert.throws(() => parseFeed('<!DOCTYPE rss [<!ENTITY x "a">]><rss/>'), { kind: "invalid-feed" });
});

test("sterke faktapremisser kan passere selv i sport", () => {
  const simple = prefilter({ title: "Fotball: Se kampens resultater" });
  const strong = prefilter({ title: "Fotball: Nye regler fører til 20 prosent økt skatt" });
  assert.ok(simple.score < 3); assert.ok(strong.score >= 3);
  assert.ok(strong.signals.some((s) => s.weight < 0));
  assert.ok(!prefilter({ title: "Kø på E18", description: "OSLO (TV 2): Trafikken står." }).signals.some((s) => s.name === "tall"));
});

test("clustering krever samme produkt og avviser ulike tall og korte titler", () => {
  const a = article("a"), b = { ...article("b"), publisher: "vg" };
  assert.equal(sameStory(a, b), true);
  assert.equal(clusterArticles([a, b]).length, 1);
  assert.equal(sameStory(a, article("c", { description: "En annen vinkling på samme hendelse." })), false);
  assert.equal(sameStory(article("a", { title: "Ny rekord" }), article("b", { title: "Ny rekord" })), false);
  assert.equal(sameStory(article("a", { title: "Skatten har økt med 20 prosent for ansatte" }), article("b", { title: "Skatten har økt med 30 prosent for ansatte" })), false);
  assert.equal(sameStory(a, article("b", { published: "2026-09-10" })), false);
  const chain = [article("a", { description: "a b c d e f g h i j" }), article("b", { description: "a b c d e f g h i k" }), article("c", { description: "a b c d e f g h k l" })];
  assert.ok(sameStory(chain[0], chain[1]) && sameStory(chain[1], chain[2]));
  assert.equal(sameStory(chain[0], chain[2]), false); assert.equal(clusterArticles(chain).length, 2);
});

test("dry run, AI-grense og feil lar ventende saker bli vurdert senere", async () => {
  const inbox = { version: 1, articles: [] };
  const first = article("a"), second = article("b", { title: "Forskning viser rekord i global energi og klima", description: "Økt med 42 prosent." });
  assert.equal(mergeArticles(inbox, [first, first, second]), 2);
  let calls = 0;
  const assess = async () => { calls++; return { ...assessment(), score: 80 }; };
  await assessInbox(inbox, { maxAiCandidates: 1, assess, log: silent });
  assert.equal(calls, 1); assert.equal(inbox.articles.filter((a) => a.status === "pending").length, 1);
  assert.equal(mergeArticles(inbox, [first, second]), 0);
  await assessInbox(inbox, { maxAiCandidates: 1, assess: async () => { throw new Error("Simulert feil"); }, log: silent });
  assert.equal(inbox.articles.filter((a) => a.status === "failed").length, 1);
  await assessInbox(inbox, { maxAiCandidates: 1, assess, log: silent });
  await assessInbox(inbox, { maxAiCandidates: 1, assess, log: silent });
  assert.equal(calls, 2); assert.ok(inbox.articles.every((a) => a.status === "assessed"));
});

test("senere duplikat gjenbruker vurdering og innboksen beholder beslutninger", async () => {
  const inbox = { version: 1, articles: [] };
  mergeArticles(inbox, [article("a")]);
  const saved = { ...assessment(), score: 80 };
  await assessInbox(inbox, { assess: async () => saved, log: silent });
  mergeArticles(inbox, [article("b")]);
  const result = await assessInbox(inbox, { assess: async () => { assert.fail("Unødvendig AI-kall"); }, log: silent });
  assert.equal(result.reused, 1);
  inbox.articles[0].decision = "selected";
  mergeArticles(inbox, [article("a", { title: "Endret tittel" })]);
  assert.equal(inbox.articles[0].decision, "selected"); assert.notEqual(inbox.articles[0].title, "Endret tittel");
  assert.equal(pruneInbox(inbox, "2027-01-01T00:00:00Z"), 1); assert.equal(inbox.articles.length, 1);
});

test("publisistvalg og deaktivert AI avgrenser faktiske modellkall", async () => {
  const inbox = { version: 1, articles: [] };
  const e24 = { ...article("e24"), publisher: "e24" };
  mergeArticles(inbox, [article("nrk"), { ...article("vg"), publisher: "vg" }, e24]);
  assert.equal(aiAllowed(e24), false); assert.equal(aiAllowed({ ...article("vg"), publisher: "vg", section: "E24" }), false);
  const calls = [];
  await assessInbox(inbox, { publisher: "vg", assess: async (a) => { calls.push(a); return { ...assessment(), score: 80 }; }, log: silent });
  assert.deepEqual(calls.map((a) => a.publisher), ["vg"]);
  assert.equal(inbox.articles.find((a) => a.publisher === "nrk").status, "pending");
  assert.equal(inbox.articles.find((a) => a.publisher === "e24").status, "pending");
});

test("API gir strukturert svar, lokal score, promptversjon og kontrollert retry", async () => {
  assert.equal(scoreAssessment({ verifiability: 10, importance: 10, sourceAvailability: 10, contextPotential: 10, factualDensity: 10 }, 10), 100);
  assert.throws(() => validateAssessment({ ...assessment(), score: 99 }), { kind: "invalid-ai-json" });
  assert.throws(() => validateAssessment({ ...assessment(), reasons: ["Artikkelen mangler dokumentasjon."] }), { kind: "invalid-ai-json" });
  const item = { ...article("a"), prefilterScore: 7.4 };
  let calls = 0;
  const result = await assessCandidate(item, { apiKey: "test-key", model: "test-model", prompt: { text: "Instruks", version: "v1" }, fetchImpl: async (url, request) => {
    calls++; assert.equal(url, "https://api.openai.com/v1/responses");
    const body = JSON.parse(request.body); assert.equal(body.store, false); assert.equal(body.text.format.strict, true);
    assert.equal(body.instructions, "Instruks"); assert.ok(!request.body.includes("test-key"));
    return Response.json({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: calls === 1 ? "bad-json" : JSON.stringify(assessment()) }] }] });
  } });
  assert.equal(calls, 2); assert.equal(result.score, 82); assert.equal(result.promptVersion, "v1");
  assert.equal(result.inputArticleId, item.id); assert.equal(result.inputMetadata.contentAccess, "metadata-only");
  let rejectedCalls = 0;
  await assert.rejects(assessCandidate(item, { apiKey: "x", prompt: { text: "x" }, fetchImpl: async () => { rejectedCalls++; return new Response("secret-server-body", { status: 401 }); } }), { message: "AI HTTP 401" });
  assert.equal(rejectedCalls, 1);
});

test("429 skiller kvote fra rategrense uten å logge kontoopplysninger eller retry", async () => {
  for (const [code, expected] of [["insufficient_quota", /API-kvoten/], ["rate_limit_exceeded", /Midlertidig rategrense/], ["unknown", /ingen gjenkjent feilkode/]]) {
    let calls = 0;
    await assert.rejects(assessCandidate(article("a"), {
      apiKey: "test-key", model: "test-model", prompt: { text: "Instruks" },
      fetchImpl: async () => { calls++; return Response.json({ error: { code, message: "PRIVATE_ACCOUNT_DETAILS" } }, { status: 429 }); },
    }), (error) => {
      assert.match(error.message, expected);
      assert.ok(!error.message.includes("PRIVATE_ACCOUNT_DETAILS"));
      assert.equal(error.fatal, true); return true;
    });
    assert.equal(calls, 1);
  }
});

test("en feedfeil stopper ikke resten; udaterte artikler beholdes uten falsk dato", async () => {
  const config = { nrk: { enabled: true, feeds: [{ type: "rss", url: "https://nrk.no/bad" }, { type: "rss", url: "https://nrk.no/good" }] } };
  const result = await fetchSources({ config, sinceHours: 48, now, log: silent, fetchImpl: async (url) => url.endsWith("bad") ? new Response("oops", { status: 503 }) : new Response('<rss><channel><item><title>Ukjent dato</title><link>https://www.nrk.no/a</link></item><item><title>Gammel sak</title><link>https://www.nrk.no/b</link><pubDate>2020-01-01</pubDate></item></channel></rss>') });
  assert.equal(result.articles.length, 1); assert.equal(result.articles[0].published, null);
  assert.equal(result.errors[0].kind, "network"); assert.equal(result.successfulFeeds, 1);
});

test("filinnboks låses, tåler ny kjøring og overskriver ikke korrupt tilstand", async (t) => {
  const directory = await temporary(t);
  const unlock = await acquireLock(directory);
  await assert.rejects(acquireLock(directory), /låst/);
  const inbox = await readInbox(directory); mergeArticles(inbox, [article("one")]);
  await saveInbox(directory, inbox); await unlock();
  assert.equal((await readInbox(directory)).articles.length, 1);
  const unlockAgain = await acquireLock(directory); await unlockAgain();
  await writeFile(path.join(directory, "inbox.json"), "corrupt");
  await assert.rejects(readInbox(directory), /ikke overskrevet/);
  assert.equal(await readFile(path.join(directory, "inbox.json"), "utf8"), "corrupt");
});

test("ekstern nøkkelfil støttes uten å legges i repoet", async (t) => {
  const directory = await temporary(t), file = path.join(directory, "radar.env");
  await writeFile(file, 'OPENAI_API_KEY="test-secret"\nOPENAI_MODEL=test-model\n');
  assert.deepEqual(await loadAiSettings({ ARTICLE_RADAR_ENV_FILE: file }), { apiKey: "test-secret", model: "test-model" });
  await assert.rejects(loadAiSettings({ ARTICLE_RADAR_ENV_FILE: new URL("../package.json", import.meta.url).pathname.replace(/^\/(\w:)/, "$1") }), /utenfor repoet/);
});

test("rapport bevarer eldre kandidater og skiller lokale signaler fra AI-score", async (t) => {
  const directory = await temporary(t), inbox = { version: 1, articles: [] };
  mergeArticles(inbox, [article("a", { title: "<img src=x> [Klikk](javascript:evil)", description: null })]);
  const candidates = rankCandidates(inbox);
  const md = renderMarkdown(candidates, { at: now, added: 0 });
  assert.match(md, /Ikke AI-vurdert/); assert.match(md, /Ingress mangler/); assert.ok(!md.includes("<img"));
  assert.match(md, /\[Klikk\\\]/); assert.match(md, /Tidligere|tidligere/);
  await writeOutput(directory, inbox, { at: now }, 15);
  assert.equal(JSON.parse(await readFile(path.join(directory, "candidates.json"))).candidates.length, 1);
  inbox.articles[0].decision = "rejected";
  assert.equal(rankCandidates(inbox).length, 0);
});

test("CLI avviser ukjente og motstridende argumenter før innboksen endres", () => {
  assert.throws(() => options(["--max-ai-candidates=0"]));
  assert.throws(() => options(["--since-hours=no"]));
  assert.throws(() => options(["--publisher=ntb"]));
  assert.throws(() => options(["--assess-only", "--no-ai"]));
  assert.throws(() => options(["--api-key=secret"]));
  assert.equal(options([]).sinceHours, 48);
});
