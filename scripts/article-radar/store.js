import { mkdir, open, readFile, rename, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { defaults } from "./config.js";
import { prefilter } from "./prefilter.js";

export async function atomicWrite(file, text) {
  const temporary = `${file}.${randomUUID()}.tmp`;
  try {
    await writeExclusive(temporary, text);
    await rename(temporary, file);
  } finally { await unlink(temporary).catch((e) => { if (e.code !== "ENOENT") throw e; }); }
}

async function writeExclusive(file, text) {
  const handle = await open(file, "wx", 0o600);
  try { await handle.writeFile(text, "utf8"); await handle.sync(); }
  finally { await handle.close(); }
}

export async function acquireLock(directory) {
  await mkdir(directory, { recursive: true });
  const file = path.join(directory, ".lock");
  try { await writeExclusive(file, JSON.stringify({ pid: process.pid, started: new Date().toISOString() })); }
  catch (e) { if (e.code === "EEXIST") throw new Error("Innboksen er låst. En annen kjøring pågår, eller .lock må fjernes etter et avbrudd. Se dokumentasjonen."); throw e; }
  return () => unlink(file);
}

export async function readInbox(directory) {
  try {
    const inbox = JSON.parse(await readFile(path.join(directory, "inbox.json"), "utf8"));
    if (inbox.version !== 1 || !Array.isArray(inbox.articles) || inbox.articles.some((a) => !a.id || !a.canonicalUrl || !a.discoveredAt)) throw new Error("Ugyldig innboksformat");
    return inbox;
  } catch (e) {
    if (e.code === "ENOENT") return { version: 1, articles: [] };
    throw new Error("Innboksen kunne ikke leses. Eksisterende data er ikke overskrevet.", { cause: e });
  }
}

export function mergeArticles(inbox, articles) {
  const byUrl = new Map(inbox.articles.map((a) => [a.canonicalUrl, a]));
  let added = 0;
  for (const article of articles) {
    const existing = byUrl.get(article.canonicalUrl);
    if (existing) {
      existing.lastSeen = article.discoveredAt;
      // Keep the exact metadata that the saved assessment refers to.
      if (!existing.assessment) Object.assign(existing, article, { discoveredAt: existing.discoveredAt });
      continue;
    }
    const entry = { ...article, lastSeen: article.discoveredAt, status: "pending", assessment: null, decision: null, attempts: 0 };
    inbox.articles.push(entry); byUrl.set(article.canonicalUrl, entry); added++;
  }
  for (const article of inbox.articles) {
    const result = prefilter(article);
    article.prefilterScore = result.score; article.prefilterSignals = result.signals;
  }
  return added;
}

export function pruneInbox(inbox, now, retentionDays = defaults.retentionDays) {
  // 90 days since discovery bounds the backlog and seen ledger. Selected stories are retained.
  const cutoff = Date.parse(now) - retentionDays * 86400000;
  const before = inbox.articles.length;
  inbox.articles = inbox.articles.filter((a) => a.decision === "selected" || Date.parse(a.discoveredAt) >= cutoff);
  return before - inbox.articles.length;
}

export async function saveInbox(directory, inbox) {
  // The inbox is authoritative. Reports and seen.json are reproducible projections.
  await atomicWrite(path.join(directory, "inbox.json"), JSON.stringify(inbox, null, 2) + "\n");
}
