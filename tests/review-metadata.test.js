import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { reviewDetails, publisherName } from "../lib/review-metadata.js";
import sourceTypes from "../src/_data/sourceTypes.js";

const require = createRequire(import.meta.url);
const nunjucks = createRequire(require.resolve("@11ty/eleventy"))("nunjucks");
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("src/_includes"));
env.addFilter("reviewDetails", reviewDetails);
env.addFilter("publisherName", publisherName);
env.addFilter("readableDate", () => "12. september 2026");
env.addFilter("htmlDate", () => "2026-09-12");

const review = { publisher: "nrk", source: "ntb", type: "urix", title: "En byråartikkel", url: "https://www.nrk.no/eksempel" };

test("ekstern produsent vises, mens publisher bestemmer navn, lenke og type", () => {
  const details = reviewDetails(review);
  assert.equal(details.name, "NRK");
  assert.equal(details.source.name, "NTB");
  assert.equal(details.type.name, "Urix");
  assert.equal(publisherName(review), "nrk.no");
  const html = env.render("components/reviewed-source.njk", { review });
  assert.match(html, /<h2>NRK:/);
  assert.match(html, /<dt>Innholdsprodusent<\/dt><dd>NTB<\/dd>/);
  assert.match(html, /href="https:\/\/www.nrk.no\/eksempel"/);
  assert.match(html, /Les originalartikkelen hos NRK/);
});

test("egenprodusert innhold gir ingen ekstra source-linje", () => {
  const html = env.render("components/reviewed-source.njk", { review: { ...review, source: "nrk" } });
  assert.doesNotMatch(html, /<dt>Innholdsprodusent<\/dt>/);
});

test("artikkelkort og kompaktliste viser publisher ved byråinnhold", () => {
  for (const template of ["article-card", "compact-article"]) {
    const html = env.render(`components/${template}.njk`, { article: { data: { review, title: "Test" }, date: new Date(), url: "/test/" } });
    assert.match(html, /nrk\.no/);
    assert.match(html, /Urix/);
    assert.doesNotMatch(html, /NTB|ntb\.no/);
  }
});

test("publisher og source er påkrevd og valideres hver for seg", () => {
  for (const field of ["publisher", "source"]) {
    for (const value of [undefined, "ukjent", "toString"]) {
      assert.throws(() => reviewDetails({ ...review, [field]: value }, "test.md"), new RegExp(`test.md: Ukjent review.${field}`));
    }
  }
});

test("typen må tilhøre publisher, også når produsenten har typen", () => {
  assert.throws(() => reviewDetails({ publisher: "vg", source: "nrk", type: "urix" }), /review.type.*publisher «vg»/);
  assert.throws(() => reviewDetails({ ...review, type: "toString" }), /review.type/);
  assert.equal(publisherName(undefined), "");
});

test("nyhetsbyråene kan krediteres som produsenter, men ikke brukes som publisher", () => {
  for (const source of ["ntb", "ap", "reuters", "afp"]) {
    assert.equal(reviewDetails({ ...review, source }).source.name, sourceTypes[source].name);
    assert.throws(() => reviewDetails({ ...review, publisher: source }), /ikke registrert som publiseringssted/);
  }
});

test("en oppføring uten produsentrolle kan ikke brukes som source", () => {
  const registry = { ...sourceTypes, publicationOnly: { ...sourceTypes.nrk, roles: ["publisher"] } };
  assert.throws(() => reviewDetails({ ...review, source: "publicationOnly" }, "test.md", registry), /ikke registrert som produsent/);
});

test("kilderegisteret viser bare tillatte metadatafelt for produsenter", () => {
  const html = env.renderString(readFileSync("src/medier.njk", "utf8"), { sourceTypes });
  for (const key of ["ntb", "ap", "reuters", "afp"]) {
    assert.match(html, new RegExp(`source: ${key}</code>`));
    assert.doesNotMatch(html, new RegExp(`publisher: ${key}</code>`));
    assert.match(html, new RegExp(`id="ownership-${key}"`));
    assert.match(html, new RegExp(`id="stateSupport-${key}"`));
  }
  assert.match(html, /publisher: nrk<\/code>/);
  assert.match(html, /source: nrk<\/code>/);
});
