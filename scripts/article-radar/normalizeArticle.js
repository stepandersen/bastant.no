import { createHash } from "node:crypto";

export const hash = (value) => createHash("sha256").update(value).digest("hex").slice(0, 24);
export const list = (value) => value == null ? [] : Array.isArray(value) ? value : [value];
export const value = (input) => typeof input === "object" && input !== null ? input["#text"] ?? "" : input ?? "";

export function cleanText(input) {
  return String(value(input)).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&").replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ").trim();
}

export function normalizeUrl(input, base) {
  const url = new URL(input, base);
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) throw new Error("Ugyldig artikkel-URL");
  // Preserve unknown query parameters, their order, paths, and fragments.
  for (const key of [...url.searchParams.keys()]) {
    if (/^utm_/i.test(key) || /^(fbclid|gclid|msclkid)$/i.test(key)) url.searchParams.delete(key);
  }
  return url.href;
}

function date(input) {
  const raw = value(input);
  return raw && Number.isFinite(Date.parse(raw)) ? new Date(raw).toISOString() : null;
}

export function normalizeArticle(raw, publisher, discovery, now = new Date().toISOString()) {
  const url = normalizeUrl(raw.url, discovery.source);
  const canonicalUrl = raw.canonicalUrl ? normalizeUrl(raw.canonicalUrl, url) : url;
  const title = cleanText(raw.title).slice(0, 1000);
  if (!title) throw new Error("Artikkelen mangler tittel");
  const authors = list(raw.authors).map(cleanText).filter(Boolean);
  // Agency credit must come from an explicit byline, never image credits or topic text.
  const producer = cleanText(raw.producer) || authors.join(" / ").match(/\b(NTB|Reuters|AFP|AP)\b/i)?.[0] || null;
  return {
    id: hash(canonicalUrl), publisher, url, canonicalUrl, title,
    description: cleanText(raw.description).slice(0, 5000) || null,
    section: cleanText(raw.section) || null,
    categories: list(raw.categories).map(cleanText).filter(Boolean),
    authors, producer, published: date(raw.published), updated: date(raw.updated),
    discoveredAt: now, discovery, contentAccess: "metadata-only",
  };
}
