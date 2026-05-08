import { learnCorrection } from "./user-memory.js";
import { learnSentencePattern } from "./sentence-memory.js";
import { learnTypoPattern } from "./typo-learner.js";
import { normalizeInput } from "./normalizer.js";
import { clearCaches } from "./cache.js";
import { appendLearningCase } from "./incremental-trainer.js";
import { recordAdaptation } from "./runtime-state.js";

export function learn(input, output, options = {}) {
  const normalized = normalizeInput(input);
  const result = {
    correction: learnCorrection(normalized, output),
    sentence: learnSentencePattern(normalized, output, options.context ?? "cli"),
    typoPatterns: [],
    corpusRows: appendLearningCase(normalized, output, "User Learning")
  };

  const inputTokens = normalized.split(/\s+/);
  const outputTokens = String(output).trim().split(/\s+/);

  if (inputTokens.length === outputTokens.length) {
    for (const token of inputTokens) {
      if (token.length >= 4) {
        const canonical = inferCanonical(token);
        if (canonical && canonical !== token) {
          const learned = learnTypoPattern(token, canonical);
          if (learned) result.typoPatterns.push(learned);
        }
      }
    }
  }

  recordAdaptation("online-learning");
  clearCaches();
  return result;
}

function inferCanonical(token) {
  const known = new Map([
    ["orrdar", "order"],
    ["ordar", "order"],
    ["odrer", "order"],
    ["oder", "order"],
    ["pree", "pre"]
  ]);

  return known.get(token) ?? null;
}
