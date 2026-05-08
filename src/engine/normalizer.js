export function normalizeInput(input) {
  return String(input ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
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

function collapseRepeatedLetters(input) {
  return input.replace(/([a-z])\1+/g, "$1");
}

