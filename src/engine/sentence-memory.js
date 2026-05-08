import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeInput } from "./normalizer.js";
import { createLRUCache } from "./cache.js";
import { parseTsonRows, writeTSON } from "../utils/tson.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const memoryPath = path.resolve(__dirname, "../data/user/sentence-memory.tson");
const sentenceCache = createLRUCache("sentence-memory", 500);

export function getSentenceMemory(inputPattern) {
  const key = normalizeInput(inputPattern);
  const cached = sentenceCache.get(key);

  if (cached !== undefined) {
    return cached;
  }

  const memory = loadSentenceMemory();
  const value = memory.get(key) ?? null;
  sentenceCache.set(key, value);
  return value;
}

export function getSentenceBoost(inputPattern, outputPattern) {
  const memory = getSentenceMemory(inputPattern);

  if (!memory || memory.outputPattern !== outputPattern) {
    return 0;
  }

  return Number(memory.scoreBoost || 0) + Math.min(5000, Number(memory.count || 0) * 150);
}

export function learnSentencePattern(inputPattern, outputPattern, context = "cli") {
  const inputKey = normalizeInput(inputPattern);
  const output = String(outputPattern ?? "").trim();

  if (!inputKey || !output) {
    return null;
  }

  const memory = loadSentenceMemory();
  const previous = memory.get(inputKey);
  const contexts = new Set((previous?.contexts ?? "").split(",").filter(Boolean));
  contexts.add(context);
  const count = previous?.outputPattern === output ? Number(previous.count || 0) + 1 : 1;
  const entry = {
    inputPattern: inputKey,
    outputPattern: output,
    count,
    contexts: [...contexts].join(","),
    updatedAt: new Date().toISOString(),
    scoreBoost: Math.min(8000, 1500 + count * 250)
  };

  memory.set(inputKey, entry);
  writeSentenceMemory(memory);
  sentenceCache.set(inputKey, entry);
  return entry;
}

export function getSentenceMemoryStats() {
  return {
    sentenceMemories: loadSentenceMemory().size
  };
}

function loadSentenceMemory() {
  const memory = new Map();

  if (!fs.existsSync(memoryPath)) {
    return memory;
  }

  for (const [inputPattern, outputPattern, count, contexts, updatedAt, scoreBoost] of parseTsonRows(
    fs.readFileSync(memoryPath, "utf8"),
    6
  )) {
    memory.set(inputPattern, {
      inputPattern,
      outputPattern,
      count: Number(count),
      contexts,
      updatedAt,
      scoreBoost: Number(scoreBoost)
    });
  }

  return memory;
}

function writeSentenceMemory(memory) {
  writeTSON(
    memoryPath,
    [...memory.values()].map((entry) => [
      entry.inputPattern,
      entry.outputPattern,
      String(entry.count),
      entry.contexts,
      entry.updatedAt,
      String(entry.scoreBoost)
    ]),
    { header: "# inputPattern\toutputPattern\tcount\tcontexts\tupdatedAt\tscoreBoost" }
  );
}

