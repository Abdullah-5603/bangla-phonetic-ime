import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCandidateDictionary } from "./dictionary-loader.js";
import { normalizeInput } from "./normalizer.js";
import { createLRUCache } from "./cache.js";
import { parseTsonRows, writeTSON } from "../utils/tson.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticPatterns = loadCandidateDictionary("typo-patterns.tson");
const typoCache = createLRUCache("typo", 1000);
const learnedPath = path.resolve(__dirname, "../data/user/learned-patterns.tson");

export function getTypoCandidates(input) {
  const key = normalizeInput(input);
  const cached = typoCache.get(key);

  if (cached !== undefined) {
    return cached;
  }

  const candidates = [];
  addPatternEntries(candidates, staticPatterns.get(key), key);
  addPatternEntries(candidates, loadLearnedPatterns().get(key), key);

  const result = candidates
    .filter((item) => item.confidence >= 0.65)
    .sort((a, b) => b.confidence - a.confidence || b.count - a.count);

  typoCache.set(key, result);
  return result;
}

export function getTypoBoost(input, canonical) {
  const match = getTypoCandidates(input).find((item) => item.canonical === canonical);

  if (!match) {
    return 0;
  }

  return Math.round(match.confidence * 4500);
}

export function learnTypoPattern(typo, canonical) {
  const typoKey = normalizeInput(typo);
  const canonicalKey = normalizeInput(canonical);

  if (!typoKey || !canonicalKey || typoKey === canonicalKey || typoKey.length < 4) {
    return null;
  }

  const patterns = loadLearnedPatterns();
  const current = patterns.get(typoKey)?.find((item) => item.canonical === canonicalKey);
  const count = Number(current?.count || 0) + 1;
  const confidence = Math.min(0.95, 0.55 + count * 0.08);
  const updated = {
    typo: typoKey,
    canonical: canonicalKey,
    count,
    confidence,
    updatedAt: new Date().toISOString()
  };

  const rows = [...patterns.values()]
    .flat()
    .filter((item) => !(item.typo === typoKey && item.canonical === canonicalKey));
  rows.push(updated);

  writeTSON(
    learnedPath,
    rows.map((item) => [
      item.typo,
      item.canonical,
      String(item.count),
      String(item.confidence),
      item.updatedAt
    ]),
    { header: "# typo\tcanonical\tcount\tconfidence\tupdatedAt" }
  );

  typoCache.set(typoKey, undefined);
  return updated;
}

export function getTypoStats() {
  return {
    staticPatterns: [...staticPatterns.keys()].length,
    learnedPatterns: [...loadLearnedPatterns().values()].flat().length
  };
}

function loadLearnedPatterns() {
  const map = new Map();

  if (!fs.existsSync(learnedPath)) {
    return map;
  }

  for (const [typo, canonical, countText, confidenceText, updatedAt] of parseTsonRows(
    fs.readFileSync(learnedPath, "utf8"),
    5
  )) {
    const entries = map.get(typo) ?? [];
    entries.push({
      typo,
      canonical,
      count: Number(countText),
      confidence: Number(confidenceText),
      updatedAt
    });
    map.set(typo, entries);
  }

  return map;
}

function addPatternEntries(candidates, entries, input) {
  for (const entry of entries ?? []) {
    candidates.push({
      typo: input,
      canonical: entry.text,
      count: Number(entry.score || 1),
      confidence: Number(entry.source || 0)
    });
  }
}

