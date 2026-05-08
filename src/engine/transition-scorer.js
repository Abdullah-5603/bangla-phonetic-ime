import { loadScoreDictionary } from "./dictionary-loader.js";
import { validateBanglaWord } from "./ranker.js";

const bigrams = loadScoreDictionary("bigrams.tson");
const scoreCache = new Map();

export function scoreTransition(previous, current, context = {}) {
  if (!previous || !current) {
    return 0;
  }

  const cacheKey = `${previous.text}\u0001${current.text}\u0001${previous.source}\u0001${current.source}`;

  if (scoreCache.has(cacheKey)) {
    return scoreCache.get(cacheKey);
  }

  let score = 0;
  const bigramKey = `${previous.text} ${current.text}`;

  if (bigrams.has(bigramKey)) {
    score += bigrams.get(bigramKey);
  }

  if (previous.source === "phrase" || current.source === "phrase") {
    score += 1200;
  }

  if (isLoanword(previous) && isLoanword(current)) {
    score += 900;
  }

  if (current.source === "user-correction") {
    score += 2000;
  }

  if (previous.text === "আমি" && current.text === "করবো") {
    score += 3000;
  }

  if (previous.text === "আমি" && current.text === "করব") {
    score -= 500;
  }

  score -= validateBanglaWord(current.text).penalty;

  scoreCache.set(cacheKey, score);
  return score;
}

function isLoanword(candidate) {
  return ["loanword", "fuzzy-loanword"].includes(candidate.source);
}

