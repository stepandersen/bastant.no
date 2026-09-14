export const defaults = {
  sinceHours: 48,
  maxAiCandidates: 25,
  reportLimit: 15,
  retentionDays: 90,
  prefilterThreshold: 3,
  model: "gpt-4.1-mini",
};

// All inputs use 0–10; only this module computes the final 0–100 score.
export const weights = {
  verifiability: 0.25,
  importance: 0.20,
  sourceAvailability: 0.20,
  contextPotential: 0.15,
  factualDensity: 0.10,
  prefilter: 0.10,
};

export const metadataLimitation = "Bare tilgjengelige metadata er vurdert. Det er ikke kontrollert om originalartikkelen allerede dokumenterer eller nyanserer disse forholdene.";
