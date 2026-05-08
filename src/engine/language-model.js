import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadScoreDictionary } from "./dictionary-loader.js";
import { createLRUCache } from "./cache.js";
import { parseTsonRows } from "../utils/tson.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const languageModelPath = path.resolve(__dirname, "../data/dictionary/language-model.tson");
const languageRows = parseTsonRows(fs.readFileSync(languageModelPath, "utf8"), 3);
const languageScores = new Map(languageRows.map(([phrase, logScore, count]) => [
  phrase,
  { logScore: Number(logScore), count: Number(count) }
]));
const quadgrams = loadScoreDictionary("quadgrams.tson");
const lmCache = createLRUCache("language-model", 1500);

export function getLanguageScore(outputs) {
  const tokens = outputs.filter(Boolean);
  const key = tokens.join(" ");
  const cached = lmCache.get(key);

  if (cached !== undefined) {
    return cached;
  }

  let score = 0;

  for (let index = 0; index < tokens.length; index += 1) {
    score += lookupBackoff(tokens, index);

    if (index >= 3) {
      const quadgram = tokens.slice(index - 3, index + 1).join(" ");
      score += (quadgrams.get(quadgram) ?? 0) / 1000;
    }
  }

  lmCache.set(key, score);
  return score;
}

export function getLanguageBreakdown(phrase) {
  const tokens = String(phrase ?? "").trim().split(/\s+/).filter(Boolean);
  const unigram = tokens.reduce((total, token) => total + getEntry(token).logScore, 0);
  const bigram = sumNgrams(tokens, 2);
  const trigram = sumNgrams(tokens, 3);
  const quadgram = sumNgrams(tokens, 4);
  const finalScore = getLanguageScore(tokens);

  return { tokens, unigram, bigram, trigram, quadgram, finalScore };
}

export function estimatePerplexity(cases) {
  let tokenCount = 0;
  let totalLog = 0;

  for (const item of cases) {
    const tokens = item.expected.split(/\s+/).filter(Boolean);
    tokenCount += tokens.length;
    totalLog += getLanguageScore(tokens);
  }

  if (tokenCount === 0) {
    return 0;
  }

  return Math.exp(-totalLog / Math.max(1, tokenCount * 10));
}

export function getLanguageModelStats() {
  return {
    entries: languageScores.size,
    quadgrams: quadgrams.size,
    cache: lmCache.stats()
  };
}

function lookupBackoff(tokens, index) {
  for (const size of [3, 2, 1]) {
    if (index - size + 1 < 0) continue;
    const phrase = tokens.slice(index - size + 1, index + 1).join(" ");
    const entry = getEntry(phrase);
    if (entry.count > 0) return entry.logScore;
  }

  return -4;
}

function sumNgrams(tokens, size) {
  let total = 0;

  for (let index = size - 1; index < tokens.length; index += 1) {
    total += getEntry(tokens.slice(index - size + 1, index + 1).join(" ")).logScore;
  }

  return total;
}

function getEntry(phrase) {
  return languageScores.get(phrase) ?? { logScore: -4, count: 0 };
}

