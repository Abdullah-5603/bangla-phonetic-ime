import {
  getDictionaryKeys,
  loadCandidateDictionary
} from "./dictionary-loader.js";
import { getMemoryCorrection } from "./user-memory.js";
import { getTypoCandidates, getTypoBoost } from "./typo-learner.js";
import { createLRUCache } from "./cache.js";
import { canonicalizeTypo } from "./typo-canonicalizer.js";
import {
  damerauLevenshtein,
  getFuzzyKeys,
  normalizeCandidateKey
} from "./normalizer.js";
import { parseWord } from "./parser.js";
import { resolveAvroMode } from "./avro-compatibility-mode.js";

const coreBangla = loadCandidateDictionary("core-bangla.tson");
const loanwords = loadCandidateDictionary("loanwords.tson");
const commonCorrections = loadCandidateDictionary("corrections.tson");
const fuzzyCache = new Map();
const candidateCache = createLRUCache("candidate", 1000);

export function generateCandidates(input, options = {}) {
  const mode = resolveAvroMode(options);
  const key = mode === "avro-strict" ? String(input ?? "") : normalizeCandidateKey(input);
  const cacheKey = `${mode}:${key}:${options.phoneticFallback !== false}`;
  const cached = candidateCache.get(cacheKey);

  if (cached !== undefined) {
    return cached;
  }

  const candidates = [];
  const exactCandidate = {
    text: parseWord(key, { useDictionary: false }),
    score: mode === "avro-strict" ? 50000 : 2500,
    source: "avro-pdf",
    meta: { input: key, mode }
  };

  if (mode === "avro-strict") {
    addCandidate(candidates, exactCandidate);
  }

  if (mode === "avro-smart") {
    addCandidate(candidates, getMemoryCorrection(normalizeCandidateKey(input)));
    addEntries(candidates, coreBangla.get(normalizeCandidateKey(input)), normalizeCandidateKey(input));
    addEntries(candidates, loanwords.get(normalizeCandidateKey(input)), normalizeCandidateKey(input));
    addEntries(
      candidates,
      commonCorrections.get(normalizeCandidateKey(input)),
      normalizeCandidateKey(input)
    );
    addTypoCandidates(candidates, normalizeCandidateKey(input));
    addCanonicalTypoCandidate(candidates, normalizeCandidateKey(input));
    addFuzzyLoanwordCandidates(candidates, normalizeCandidateKey(input));
    addCandidate(candidates, exactCandidate);
  }

  if (mode === "avro-smart" && options.phoneticFallback !== false) {
    addCandidate(candidates, {
      text: parseWord(normalizeCandidateKey(input), { useDictionary: false }),
      score: 1200,
      source: "phonetic",
      meta: { input: normalizeCandidateKey(input) }
    });
  }

  const result = uniqueCandidates(candidates);
  candidateCache.set(cacheKey, result);
  return result;
}

function addCanonicalTypoCandidate(candidates, key) {
  const canonical = canonicalizeTypo(key);

  if (canonical.canonical === key || canonical.confidence < 0.65) {
    return;
  }

  const entries = loanwords.get(canonical.canonical) ?? coreBangla.get(canonical.canonical) ?? [];

  for (const entry of entries) {
    addCandidate(candidates, {
      ...entry,
      score: Number(entry.score || 0) + Math.round(canonical.confidence * 3500),
      source: "typo-canonical",
      meta: {
        ...(entry.meta ?? {}),
        input: key,
        canonical: canonical.canonical,
        typoConfidence: canonical.confidence
      }
    });
  }
}

function addTypoCandidates(candidates, key) {
  for (const typo of getTypoCandidates(key)) {
    const entries = loanwords.get(typo.canonical) ?? coreBangla.get(typo.canonical) ?? [];

    for (const entry of entries) {
      addCandidate(candidates, {
        ...entry,
        score: Math.max(Number(entry.score || 0), 5000) + getTypoBoost(key, typo.canonical),
        source: "typo-learned",
        meta: {
          ...(entry.meta ?? {}),
          input: key,
          canonical: typo.canonical,
          typoConfidence: typo.confidence
        }
      });
    }
  }
}

function addFuzzyLoanwordCandidates(candidates, key) {
  for (const fuzzyKey of getFuzzyLoanwordKeys(key)) {
    addEntries(candidates, toFuzzyEntries(loanwords.get(fuzzyKey), fuzzyKey), key);
  }
}

function getFuzzyLoanwordKeys(key) {
  if (fuzzyCache.has(key)) {
    return fuzzyCache.get(key);
  }

  const keys = new Set();

  for (const fuzzyKey of getFuzzyKeys(key)) {
    if (fuzzyKey !== key && loanwords.has(fuzzyKey)) {
      keys.add(fuzzyKey);
    }
  }

  if (key.length >= 4) {
    for (const dictionaryKey of getDictionaryKeys("loanwords.tson")) {
      if (dictionaryKey === key || dictionaryKey.length < 4) {
        continue;
      }

      const entries = loanwords.get(dictionaryKey) ?? [];
      const highConfidence = entries.some((entry) => Number(entry.score) >= 9000);

      if (highConfidence && damerauLevenshtein(key, dictionaryKey, 2) <= 2) {
        keys.add(dictionaryKey);
      }
    }
  }

  const result = [...keys];
  fuzzyCache.set(key, result);
  return result;
}

function toFuzzyEntries(entries, fuzzyKey) {
  return (entries ?? []).map((entry) => ({
    ...entry,
    score: Math.min(Number(entry.score || 0), 5000),
    source: "fuzzy-loanword",
    meta: {
      ...(entry.meta ?? {}),
      fuzzyKey
    }
  }));
}

function addEntries(candidates, entries, input) {
  for (const entry of entries ?? []) {
    addCandidate(candidates, {
      ...entry,
      meta: {
        ...(entry.meta ?? {}),
        input
      }
    });
  }
}

function addCandidate(candidates, candidate) {
  if (candidate?.text) {
    candidates.push(candidate);
  }
}

function uniqueCandidates(candidates) {
  const seen = new Map();

  for (const candidate of candidates) {
    const previous = seen.get(candidate.text);

    if (!previous || Number(candidate.score || 0) > Number(previous.score || 0)) {
      seen.set(candidate.text, candidate);
    }
  }

  return [...seen.values()];
}
