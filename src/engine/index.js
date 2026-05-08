import { generateCandidates } from "./candidate-generator.js";
import { normalizeInput } from "./normalizer.js";
import { getPhraseCandidatesAt } from "./phrase-resolver.js";
import { rankCandidates } from "./ranker.js";
import { searchSentence, transliterateSentence } from "./transliterate.js";
import { tokenize } from "./tokenizer.js";

export { learnCorrection } from "./user-memory.js";
export { learn } from "./online-learning.js";
export { searchSentence } from "./transliterate.js";

export function transliterate(input, options = {}) {
  return transliterateSentence(input, options);
}

export function getCandidates(input, options = {}) {
  const normalized = normalizeInput(input);
  const tokens = tokenize(normalized);
  const phraseCandidates = getPhraseCandidatesAt(tokens, 0).filter(
    (candidate) => Number(candidate.meta?.tokenLength || 0) === tokens.length
  );

  if (phraseCandidates.length > 0) {
    return phraseCandidates;
  }

  if (tokens.length === 1 && tokens[0].type === "word") {
    return rankCandidates(generateCandidates(tokens[0].value, options), {
      exactInput: tokens[0].value
    });
  }

  const candidate = {
    text: transliterateSentence(normalized, options),
    score: 1000,
    source: "composed",
    meta: { input: normalized }
  };

  return [candidate];
}
