import { createLRUCache } from "./cache.js";

const normalizeCache = createLRUCache("normalization", 1000);

export function normalizeInput(input) {
  const source = String(input ?? "");
  const cached = normalizeCache.get(source);

  if (cached !== undefined) {
    return cached;
  }

  const normalized = source
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  normalizeCache.set(source, normalized);
  return normalized;
}

export function normalizeCandidateKey(input) {
  return normalizeInput(input);
}

export function getFuzzyKeys(input) {
  const key = normalizeCandidateKey(input);
  const keys = new Set([key]);

  keys.add(collapseRepeatedLetters(key));
  keys.add(key.replace(/er\b/g, "ar"));
  keys.add(key.replace(/ar\b/g, "er"));
  keys.add(collapseRepeatedLetters(key).replace(/er\b/g, "ar"));
  keys.add(collapseRepeatedLetters(key).replace(/ar\b/g, "er"));

  return [...keys].filter(Boolean);
}

export function damerauLevenshtein(a, b, maxDistance = 2) {
  const left = String(a ?? "");
  const right = String(b ?? "");

  if (Math.abs(left.length - right.length) > maxDistance) {
    return maxDistance + 1;
  }

  const distances = Array.from({ length: left.length + 1 }, () =>
    Array(right.length + 1).fill(0)
  );

  for (let i = 0; i <= left.length; i += 1) distances[i][0] = i;
  for (let j = 0; j <= right.length; j += 1) distances[0][j] = j;

  for (let i = 1; i <= left.length; i += 1) {
    let rowMin = Infinity;

    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;

      distances[i][j] = Math.min(
        distances[i - 1][j] + 1,
        distances[i][j - 1] + 1,
        distances[i - 1][j - 1] + cost
      );

      if (
        i > 1 &&
        j > 1 &&
        left[i - 1] === right[j - 2] &&
        left[i - 2] === right[j - 1]
      ) {
        distances[i][j] = Math.min(distances[i][j], distances[i - 2][j - 2] + 1);
      }

      rowMin = Math.min(rowMin, distances[i][j]);
    }

    if (rowMin > maxDistance) {
      return maxDistance + 1;
    }
  }

  return distances[left.length][right.length];
}

function collapseRepeatedLetters(input) {
  return input.replace(/([a-z])\1+/g, "$1");
}
