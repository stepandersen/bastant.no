import test from "node:test";
import assert from "node:assert/strict";
import { relatedArticles } from "../lib/article-relations.js";

const article = (slug, respondsTo, status = "published") => ({
  fileSlug: slug,
  url: status === "draft" ? false : `/artikler/${slug}/`,
  data: { title: slug, respondsTo, status },
});

test("one declaration creates links in both directions and supports multiple replies", () => {
  const articles = [article("original"), article("reply", "original"), article("second", "original"), article("unrelated")];
  assert.deepEqual(relatedArticles(articles, "original").map(item => item.url), ["/artikler/reply/", "/artikler/second/"]);
  assert.deepEqual(relatedArticles(articles, "reply").map(item => item.url), ["/artikler/original/"]);
  assert.notEqual(relatedArticles(articles, "original")[0].description, relatedArticles(articles, "reply")[0].description);
  assert.deepEqual(relatedArticles(articles, "unrelated"), []);
});

test("drafts, missing targets and self references never produce links", () => {
  const articles = [article("original"), article("reply", "original", "draft"), article("orphan", "missing"), article("self", "self")];
  for (const slug of ["original", "reply", "orphan", "self", "missing"]) {
    assert.deepEqual(relatedArticles(articles, slug), []);
  }
});
