import { coreBangla } from "../data/dictionary/core-bangla.js";
import { commonCorrections } from "../data/dictionary/common-corrections.js";
import { loanwords } from "../data/dictionary/loanwords.js";
import { getMemoryCorrection } from "./user-memory.js";
import { getFuzzyKeys, normalizeCandidateKey } from "./normalizer.js";
import { parseWord } from "./parser.js";

export function generateCandidates(input, options = {}) {
  const key = normalizeCandidateKey(input);
  const candidates = [];

  addCandidate(candidates, getMemoryCorrection(key));
  addEntries(candidates, coreBangla[key], key);
  addEntries(candidates, loanwords[key], key);
  addEntries(candidates, commonCorrections[key], key);
  addFuzzyLoanwordCandidates(candidates, key);

  if (options.phoneticFallback !== false) {
    addCandidate(candidates, {
      text: parseWord(key, { useDictionary: false }),
      score: 1200,
      source: "phonetic",
      meta: { input: key }
    });
  }

  return uniqueCandidates(candidates);
}

function addFuzzyLoanwordCandidates(candidates, key) {
  for (const fuzzyKey of getFuzzyKeys(key)) {
    if (fuzzyKey === key || !loanwords[fuzzyKey]) {
      continue;
    }

    addEntries(
      candidates,
      loanwords[fuzzyKey].map((entry) => ({
        ...entry,
        score: Math.min(Number(entry.score || 0), 5000),
        source: "fuzzy-loanword",
        meta: {
          ...(entry.meta ?? {}),
          fuzzyKey
        }
      })),
      key
    );
  }
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

