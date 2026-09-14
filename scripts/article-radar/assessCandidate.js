import { readFile, realpath } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { parseEnv } from "node:util";
import { fileURLToPath } from "node:url";
import { defaults, metadataLimitation, weights } from "./config.js";
import { hash } from "./normalizeArticle.js";
import { RadarError } from "./parseFeed.js";

const dimensionNames = Object.keys(weights).filter((key) => key !== "prefilter");
const strings = { type: "array", items: { type: "string" }, maxItems: 8 };
export const assessmentSchema = {
  type: "object", additionalProperties: false,
  required: ["confidence", "dimensions", "reasons", "researchQuestions", "likelyPrimarySources", "limitations"],
  properties: {
    confidence: { type: "string", enum: ["low", "medium", "high"] },
    dimensions: { type: "object", additionalProperties: false, required: dimensionNames, properties: Object.fromEntries(dimensionNames.map((name) => [name, { type: "number", minimum: 0, maximum: 10 }])) },
    reasons: { ...strings, minItems: 1 }, researchQuestions: { ...strings, minItems: 2, maxItems: 5 },
    likelyPrimarySources: strings, limitations: { ...strings, minItems: 1 },
  },
};

export function scoreAssessment(dimensions, prefilterScore) {
  return Math.round(10 * (dimensionNames.reduce((sum, name) => sum + dimensions[name] * weights[name], 0) + prefilterScore * weights.prefilter));
}

export function validateAssessment(result) {
  const invalid = () => { throw new RadarError("invalid-ai-json", "AI-resultatet følger ikke vurderingsskjemaet"); };
  if (!result || Array.isArray(result) || typeof result !== "object") invalid();
  if (Object.keys(result).sort().join() !== [...assessmentSchema.required].sort().join()) invalid();
  if (!["low", "medium", "high"].includes(result.confidence)) invalid();
  if (!result.dimensions || Object.keys(result.dimensions).sort().join() !== [...dimensionNames].sort().join()) invalid();
  for (const name of dimensionNames) if (!Number.isFinite(result.dimensions[name]) || result.dimensions[name] < 0 || result.dimensions[name] > 10) invalid();
  for (const name of ["reasons", "researchQuestions", "likelyPrimarySources", "limitations"]) {
    const values = result[name];
    const { minItems = 0, maxItems } = assessmentSchema.properties[name];
    if (!Array.isArray(values) || values.length < minItems || values.length > maxItems || values.some((v) => typeof v !== "string" || !v.trim() || v.length > 1200)) invalid();
  }
  const text = [...result.reasons, ...result.researchQuestions, ...result.likelyPrimarySources].join(" ");
  // Additional conservative guard, not a replacement for prompt instructions or human review.
  if (/\b(?:missing-context|documented|misleading|unsupported|incorrect|unresolved|propaganda|agenda|lyver)\b|(?:artikkelen|journalisten|avisen)\s+(?:mangler|lyver|villeder|er\s+(?:feil|misvisende))|politisk(?:e)?\s+motiv/iu.test(text)) {
    throw new RadarError("invalid-ai-json", "AI-resultatet brøt de redaksjonelle grensene");
  }
  return result;
}

export async function loadAiSettings(env = process.env) {
  const envFile = env.ARTICLE_RADAR_ENV_FILE || path.join(homedir(), ".config", "bastant", "article-radar.env");
  let fileEnv = {};
  try {
    const actual = await realpath(envFile);
    const root = await realpath(fileURLToPath(new URL("../../", import.meta.url)));
    const relative = path.relative(root, actual);
    if (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative)) throw new Error("API-konfigurasjonen må ligge utenfor repoet");
    fileEnv = parseEnv(await readFile(actual, "utf8"));
  } catch (error) { if (error.code !== "ENOENT" || env.ARTICLE_RADAR_ENV_FILE) throw error; }
  return { apiKey: env.OPENAI_API_KEY || fileEnv.OPENAI_API_KEY, model: env.OPENAI_MODEL || fileEnv.OPENAI_MODEL || defaults.model };
}

export async function loadPrompt() {
  const text = await readFile(new URL("./assessment-prompt.md", import.meta.url), "utf8");
  return { text, version: hash(text) };
}

export async function assessCandidate(article, { apiKey, model, prompt, fetchImpl = fetch }) {
  const metadata = {
    publisher: article.publisher, title: article.title, description: article.description,
    section: article.section, categories: article.categories, authors: article.authors,
    producer: article.producer, published: article.published, contentAccess: "metadata-only",
  };
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      let response;
      try {
        response = await fetchImpl("https://api.openai.com/v1/responses", {
          method: "POST", headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
          signal: AbortSignal.timeout(60000),
          body: JSON.stringify({ model, store: false, instructions: prompt.text, input: JSON.stringify(metadata), max_output_tokens: 2200,
            text: { format: { type: "json_schema", name: "radar_assessment", strict: true, schema: assessmentSchema } } }),
        });
      } catch { throw new RadarError("ai", "Nettverksfeil eller tidsavbrudd ved AI-kall"); }
      if (!response.ok) {
        const error = new RadarError("ai", `AI HTTP ${response.status}`);
        error.fatal = [400, 401, 403, 404, 429].includes(response.status);
        throw error;
      }
      let result;
      try {
        const body = await response.json();
        if (body.status !== "completed") throw new Error("Ikke fullført");
        const text = (body.output ?? []).filter((item) => item.type === "message").flatMap((item) => item.content ?? []).filter((part) => part.type === "output_text").map((part) => part.text).join("");
        result = validateAssessment(JSON.parse(text));
      } catch (error) { throw error instanceof RadarError ? error : new RadarError("invalid-ai-json", "AI returnerte ikke et fullført, gyldig JSON-resultat"); }
      return { ...result, score: scoreAssessment(result.dimensions, article.prefilterScore),
        limitations: [...new Set([metadataLimitation, ...result.limitations])],
        model, promptVersion: prompt.version, assessedAt: new Date().toISOString(),
        inputArticleId: article.id, inputMetadata: metadata,
      };
    } catch (error) {
      lastError = error;
      if (error.fatal) throw error;
    }
  }
  throw lastError;
}
