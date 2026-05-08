import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseTsonRows } from "./tson.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dictionaryDir = path.resolve(__dirname, "../data/dictionary");
const cache = new Map();

export function loadCandidateDictionary(name) {
  return getCached(name, () => {
    const rows = parseTsonRows(readDictionaryFile(name), 4);
    const dictionary = new Map();

    for (const [input, text, scoreText, source] of rows) {
      const score = Number(scoreText);

      if (!input || !text || !Number.isFinite(score) || !source) {
        throw new SyntaxError(`Invalid candidate row in ${name}.`);
      }

      const entries = dictionary.get(input) ?? [];
      entries.push({ text, score, source });
      dictionary.set(input, entries);
    }

    return dictionary;
  });
}

export function loadScoreDictionary(name) {
  return getCached(name, () => {
    const rows = parseTsonRows(readDictionaryFile(name), 2);
    const scores = new Map();

    for (const [key, scoreText] of rows) {
      const score = Number(scoreText);

      if (!key || !Number.isFinite(score)) {
        throw new SyntaxError(`Invalid score row in ${name}.`);
      }

      scores.set(key, score);
    }

    return scores;
  });
}

export function getDictionaryKeys(name) {
  return [...loadCandidateDictionary(name).keys()];
}

function readDictionaryFile(name) {
  return fs.readFileSync(path.join(dictionaryDir, name), "utf8");
}

function getCached(name, loader) {
  if (!cache.has(name)) {
    cache.set(name, loader());
  }

  return cache.get(name);
}
