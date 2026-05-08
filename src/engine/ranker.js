const DEFAULT_SCORES = {
  "user-correction": 20000,
  phrase: 15000,
  dictionary: 10000,
  loanword: 9000,
  "common-correction": 8000,
  "fuzzy-loanword": 5000,
  phonetic: 1000
};

export function rankCandidates(candidates, context = {}) {
  return uniqueCandidates(candidates)
    .map((candidate) => ({
      ...candidate,
      score: scoreCandidate(candidate, context)
    }))
    .sort((a, b) => b.score - a.score || sourceRank(b.source) - sourceRank(a.source));
}

function scoreCandidate(candidate, context) {
  let score = Number(candidate.score ?? DEFAULT_SCORES[candidate.source] ?? 0);

  score -= getOutputPenalty(candidate.text);

  if (candidate.source === "phonetic" && looksLowConfidence(candidate.text)) {
    score -= 300;
  }

  return Math.max(0, Math.round(score));
}

function getOutputPenalty(output) {
  let penalty = 0;

  if (/্{2,}/.test(output)) {
    penalty += 700;
  }

  if (/([\u0980-\u09FF])\1{2,}/.test(output)) {
    penalty += 300;
  }

  return penalty;
}

function looksLowConfidence(output) {
  return /[a-z]/i.test(output) || output.length === 0;
}

function sourceRank(source) {
  return DEFAULT_SCORES[source] ?? 0;
}

function uniqueCandidates(candidates) {
  const seen = new Map();

  for (const candidate of candidates) {
    if (!candidate?.text) {
      continue;
    }

    const previous = seen.get(candidate.text);
    if (!previous || Number(candidate.score || 0) > Number(previous.score || 0)) {
      seen.set(candidate.text, candidate);
    }
  }

  return [...seen.values()];
}
