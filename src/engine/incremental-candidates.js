import { generateCandidates } from "./candidate-generator.js";
import { normalizeInput } from "./normalizer.js";
import { getPhraseCandidatesAt } from "./phrase-resolver.js";
import { rankCandidates } from "./ranker.js";
import { transliterateSentence } from "./transliterate.js";
import { tokenize } from "./tokenizer.js";
import { resolveAvroMode } from "./avro-compatibility-mode.js";

export function createIncrementalCandidateUpdater(options = {}) {
  const cache = options.cache;
  let lastBuffer = "";
  let lastCandidates = [];

  return {
    update(buffer) {
      const cached = cache?.get(buffer);
      if (cached !== undefined) {
        lastBuffer = buffer;
        lastCandidates = cached;
        return cached;
      }

      const candidates =
        buffer === ""
          ? []
          : getStreamingCandidates(buffer, options).slice(0, options.limit ?? 5);

      const normalized = ensureCandidateShape(buffer, candidates);
      cache?.set(buffer, normalized);
      lastBuffer = buffer;
      lastCandidates = normalized;
      return normalized;
    },
    getLast() {
      return { buffer: lastBuffer, candidates: lastCandidates };
    }
  };
}

function ensureCandidateShape(buffer, candidates) {
  if (candidates.length > 0) {
    return candidates;
  }

  return [
    {
      text: transliterateSentence(buffer),
      score: 1,
      source: "streaming-fallback",
      meta: { input: buffer }
    }
  ];
}

function getStreamingCandidates(input, options = {}) {
  const mode = resolveAvroMode(options);
  const normalized = mode === "avro-strict" ? String(input ?? "") : normalizeInput(input);
  const tokens = tokenize(normalized);
  const phraseCandidates =
    mode === "avro-smart"
      ? getPhraseCandidatesAt(tokens, 0).filter(
          (candidate) => Number(candidate.meta?.tokenLength || 0) === tokens.length
        )
      : [];

  if (phraseCandidates.length > 0) return phraseCandidates;

  if (tokens.length === 1 && tokens[0].type === "word") {
    return rankCandidates(generateCandidates(tokens[0].value, options), {
      exactInput: tokens[0].value
    });
  }

  return [
    {
      text: transliterateSentence(normalized, options),
      score: 1000,
      source: "streaming-composed",
      meta: { input: normalized }
    }
  ];
}
