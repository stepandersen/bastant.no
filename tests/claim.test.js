import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { renderClaim } from "../lib/claim.js";

const require = createRequire(import.meta.url);
const MarkdownIt = createRequire(require.resolve("@11ty/eleventy"))("markdown-it");

test("utelatelser presenteres som kontekstvurderinger med synlig betydning og kildebelegg", () => {
  const html = new MarkdownIt({ html: true }).render(renderClaim(
    "**Hva mangler:** Dokumentasjon med [kilde 1](https://example.org/).",
    "missing-context", "Befolkningsgrunnlaget", "Antallet per innbygger har gått ned.",
  ));
  const summary = html.split("</summary>")[0];
  assert.match(html, /<details class="claim claim--missing-context">/);
  assert.match(summary, /Kontekstvurdering/);
  assert.match(summary, /Manglende vesentlig kontekst/);
  assert.match(summary, /Betydning for forståelsen:<\/strong> Antallet per innbygger har gått ned\./);
  assert.doesNotMatch(summary, /Bastants vurdering:|Sentralt for hovedbudskapet/);
  assert.match(html, /<strong>Hva mangler:<\/strong>/);
  assert.match(html, /href="https:\/\/example.org\/"/);
});

test("minikonklusjonen er synlig, utdyping lukket og Markdown-kilder rendres", () => {
  const html = new MarkdownIt({ html: true }).render(renderClaim(
    "Dokumentasjon med **forbehold** og [kilde 1](#kilde-1).", "context", "Påstand", "Svar med forbehold.",
  ));
  assert.match(html, /<details class="claim">/);
  const summary = html.split("</summary>")[0];
  assert.match(summary, /Svar med forbehold\./);
  assert.match(summary, /Trenger kontekst/);
  assert.doesNotMatch(summary, /Sentralt for/);
  assert.match(html, /<strong>forbehold<\/strong>/);
  assert.match(html, /href="#kilde-1"/);
});

test("sentralmarkering krever begrunnelse og tekstargumenter escapes", () => {
  const html = renderClaim("Tekst", "documented", "<img>", "A & B", "Bærer premisset.");
  assert.match(html, /Sentralt for hovedbudskapet/);
  assert.match(html, /Hvorfor sentralt:<\/strong> Bærer premisset\./);
  assert.match(html, /&lt;img&gt;/);
  assert.match(html, /A &amp; B/);
  assert.throws(() => renderClaim("Tekst", "severe", "Tittel", "Svar"));
  assert.throws(() => renderClaim("Tekst", "context", "Tittel", ""));
});
