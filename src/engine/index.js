import { generateCandidates } from "./candidate-generator.js";
import { normalizeInput } from "./normalizer.js";
import { getPhraseCandidatesAt } from "./phrase-resolver.js";
import { rankCandidates } from "./ranker.js";
import { searchSentence, transliterateSentence } from "./transliterate.js";
import { tokenize } from "./tokenizer.js";
import { resolveAvroMode } from "./avro-compatibility-mode.js";

export { learnCorrection } from "./user-memory.js";
export { learn } from "./online-learning.js";
export { createStreamingSession } from "./streaming-session.js";
export { createInputSession } from "./ime-contract.js";
export { searchSentence } from "./transliterate.js";
export { getLanguageBreakdown, getLanguageModelStats } from "./language-model.js";
export { getProfile, listProfiles, setProfile } from "./profile-manager.js";
export { getRuntimeStats } from "./runtime-state.js";

export function transliterate(input, options = {}) {
  return transliterateSentence(input, options);
}

export function getCandidates(input, options = {}) {
  const mode = resolveAvroMode(options);
  const rawInput = String(input ?? "").trim();
  const normalized = mode === "avro-strict" ? rawInput : normalizeInput(rawInput);
  const tokens = tokenize(normalized);
  const phraseCandidates =
    mode === "avro-smart"
      ? getPhraseCandidatesAt(tokens, 0).filter(
          (candidate) => Number(candidate.meta?.tokenLength || 0) === tokens.length
        )
      : [];

  if (phraseCandidates.length > 0) {
    return phraseCandidates;
  }

  if (tokens.length === 1 && tokens[0].type === "word") {
    const ranked = rankCandidates(generateCandidates(tokens[0].value, options), {
      exactInput: tokens[0].value
    });
    if (mode !== "avro-smart") {
      return ranked;
    }

    const strictText = transliterateSentence(rawInput, { ...options, mode: "avro-strict" });
    if (ranked.some((candidate) => candidate.text === strictText)) {
      return ranked;
    }

    return rankCandidates(
      [
        ...ranked,
        {
          text: strictText,
          score: 2400,
          source: "avro-pdf",
          meta: { input: rawInput, mode: "avro-strict" }
        }
      ],
      { exactInput: tokens[0].value }
    );
  }

  const candidate = {
    text: transliterateSentence(mode === "avro-strict" ? input : normalized, options),
    score: 1000,
    source: mode === "avro-strict" ? "avro-pdf" : "composed",
    meta: { input: normalized, mode }
  };

  return [candidate];
}
