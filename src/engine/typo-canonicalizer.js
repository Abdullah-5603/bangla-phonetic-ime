import { getDictionaryKeys } from "./dictionary-loader.js";
import { createLRUCache } from "./cache.js";
import { damerauLevenshtein, normalizeInput } from "./normalizer.js";
import { getTypoCandidates } from "./typo-learner.js";

const canonicalCache = createLRUCache("canonicalization", 1000);

export function canonicalizeTypo(input) {
  const key = normalizeInput(input);
  const cached = canonicalCache.get(key);
  if (cached !== undefined) return cached;

  const learned = getTypoCandidates(key)[0];
  if (learned?.confidence >= 0.65) {
    const result = {
      input: key,
      canonical: learned.canonical,
      confidence: learned.confidence,
      source: "learned"
    };
    canonicalCache.set(key, result);
    return result;
  }

  if (key.length < 4) {
    const result = { input: key, canonical: key, confidence: 1, source: "exact" };
    canonicalCache.set(key, result);
    return result;
  }

  const candidates = [...getDictionaryKeys("loanwords.tson"), ...getDictionaryKeys("core-bangla.tson")]
    .filter((item) => Math.abs(item.length - key.length) <= 2)
    .map((item) => ({ item, distance: damerauLevenshtein(key, item, 2) }))
    .filter((item) => item.distance <= 2)
    .sort((a, b) => a.distance - b.distance);

  const best = candidates[0];
  const result = best
    ? {
        input: key,
        canonical: best.item,
        confidence: Math.max(0.55, 1 - best.distance * 0.18),
        source: "distance"
      }
    : { input: key, canonical: key, confidence: 1, source: "none" };

  canonicalCache.set(key, result);
  return result;
}

