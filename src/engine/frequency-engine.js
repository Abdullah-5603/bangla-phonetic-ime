import { loadScoreDictionary } from "./dictionary-loader.js";
import { createLRUCache } from "./cache.js";

const frequencies = loadScoreDictionary("frequency-table.tson");
const bigrams = loadScoreDictionary("bigrams.tson");
const trigrams = loadScoreDictionary("trigrams.tson");
const grammarPatterns = loadScoreDictionary("grammar-patterns.tson");
const ngramCache = createLRUCache("ngram", 1000);

export function getFrequencyScore(output) {
  const frequency = frequencies.get(output) ?? 0;
  return Math.min(4000, Math.round(frequency / 5));
}

export function getBigramScore(previous, current) {
  return getPhraseScore(`${previous} ${current}`, bigrams);
}

export function getTrigramScore(first, second, third) {
  return getPhraseScore(`${first} ${second} ${third}`, trigrams);
}

export function getGrammarScore(previous, current) {
  return getPhraseScore(`${previous} ${current}`, grammarPatterns);
}

export function getSentenceProbability(outputs) {
  let score = 0;

  for (let index = 0; index < outputs.length; index += 1) {
    score += getFrequencyScore(outputs[index]);

    if (index > 0) {
      score += getBigramScore(outputs[index - 1], outputs[index]);
      score += getGrammarScore(outputs[index - 1], outputs[index]);
    }

    if (index > 1) {
      score += getTrigramScore(outputs[index - 2], outputs[index - 1], outputs[index]);
    }
  }

  return score;
}

function getPhraseScore(key, table) {
  const cacheKey = `${table.size}:${key}`;
  const cached = ngramCache.get(cacheKey);

  if (cached !== undefined) {
    return cached;
  }

  const score = table.get(key) ?? 0;
  ngramCache.set(cacheKey, score);
  return score;
}

