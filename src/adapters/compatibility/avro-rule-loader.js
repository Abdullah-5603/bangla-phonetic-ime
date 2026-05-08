import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseTsonRows } from "../../utils/tson.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const avroDir = path.resolve(__dirname, "../../data/avro");
const cache = new Map();

export function loadAvroRules() {
  return loadCandidateFile("avro-phonetic-rules.tson");
}

export function loadAvroExceptions() {
  return loadCandidateFile("avro-exceptions.tson");
}

export function loadAvroAutocorrect() {
  return loadCandidateFile("avro-autocorrect.tson");
}

export function loadAvroCompatibilityCorpus() {
  return parseTsonRows(readAvroFile("avro-compatibility-corpus.tson"), 3).map(
    ([input, expected, category]) => ({ input, expected, category })
  );
}

export function getAvroCandidate(input) {
  const key = String(input ?? "");
  const lowerKey = key.toLowerCase();
  const dictionaries = [
    loadAvroExceptions(),
    loadAvroRules(),
    loadAvroAutocorrect()
  ];

  for (const dictionary of dictionaries) {
    const entries = dictionary.get(key) ?? dictionary.get(lowerKey);
    if (entries?.length) {
      return {
        ...entries[0],
        meta: {
          ...(entries[0].meta ?? {}),
          input: key
        }
      };
    }
  }

  return null;
}

export function getAvroCandidates(input) {
  const candidate = getAvroCandidate(input);
  return candidate ? [candidate] : [];
}

function loadCandidateFile(name) {
  if (cache.has(name)) {
    return cache.get(name);
  }

  const dictionary = new Map();
  for (const [input, text, score, category] of parseTsonRows(readAvroFile(name), 4)) {
    const entries = dictionary.get(input) ?? [];
    entries.push({
      text,
      score: Number(score),
      source: "avro-compat",
      meta: { category, input }
    });
    dictionary.set(input, entries);
  }

  cache.set(name, dictionary);
  return dictionary;
}

function readAvroFile(name) {
  return fs.readFileSync(path.join(avroDir, name), "utf8");
}

