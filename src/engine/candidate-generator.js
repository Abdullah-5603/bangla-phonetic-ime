import {
  getDictionaryKeys,
  loadCandidateDictionary
} from "./dictionary-loader.js";
import { getMemoryCorrection } from "./user-memory.js";
import { getTypoCandidates, getTypoBoost } from "./typo-learner.js";
import { createLRUCache } from "./cache.js";
import { canonicalizeTypo } from "./typo-canonicalizer.js";
import { getAvroCandidate } from "../adapters/compatibility/avro-rule-loader.js";
import {
  damerauLevenshtein,
  getFuzzyKeys,
  normalizeCandidateKey
} from "./normalizer.js";
import { parseWord } from "./parser.js";

const coreBangla = loadCandidateDictionary("core-bangla.tson");
const loanwords = loadCandidateDictionary("loanwords.tson");
const commonCorrections = loadCandidateDictionary("corrections.tson");
const fuzzyCache = new Map();
const candidateCache = createLRUCache("candidate", 1000);

export function generateCandidates(input, options = {}) {
  const key = normalizeCandidateKey(input);
  const cacheKey = `${key}:${options.phoneticFallback !== false}`;
  const cached = candidateCache.get(cacheKey);

  if (cached !== undefined) {
    return cached;
  }

  const candidates = [];

  addCandidate(candidates, getAvroCandidate(key));
  addCandidate(candidates, getMemoryCorrection(key));
  addEntries(candidates, coreBangla.get(key), key);
  addEntries(candidates, loanwords.get(key), key);
  addEntries(candidates, commonCorrections.get(key), key);
  addTypoCandidates(candidates, key);
  addCanonicalTypoCandidate(candidates, key);
  addFuzzyLoanwordCandidates(candidates, key);

  if (options.phoneticFallback !== false) {
    addCandidate(candidates, {
      text: parseWord(key, { useDictionary: false }),
      score: 1200,
      source: "phonetic",
      meta: { input: key }
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
