import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseTsonRows } from "./tson.js";
import { sortRules } from "./avro-rule-matcher.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const avroSpecDir = path.resolve(__dirname, "../data/avro");

let cachedSpec = null;

export function loadAvroPdfSpec() {
  if (cachedSpec) {
    return cachedSpec;
  }

  cachedSpec = {
    vowels: sortRules(loadRows("pdf-spec-vowels.tson", 2).map(([key, value]) => ({ key, value }))),
    consonants: sortRules(
      loadRows("pdf-spec-consonants.tson", 3).map(([key, value, joinable]) => ({
        key,
        value,
        joinable: joinable === "1"
      }))
    ),
    kars: sortRules(loadRows("pdf-spec-kars.tson", 2).map(([key, value]) => ({ key, value }))),
    fola: sortRules(loadRows("pdf-spec-fola.tson", 2).map(([key, value]) => ({ key, value }))),
    special: sortRules(loadRows("pdf-spec-special-rules.tson", 3).map(([key, value, kind]) => ({ key, value, kind }))),
    accentPrefix: sortRules(
      loadRows("pdf-spec-special-rules.tson", 3)
        .filter(([, , kind]) => kind === "accent-prefix")
        .map(([key, value]) => ({ key, value }))
    ),
    accentSuffix: sortRules(
      loadRows("pdf-spec-special-rules.tson", 3)
        .filter(([, , kind]) => kind === "accent-suffix")
        .map(([key, value]) => ({ key, value }))
    )
  };

  return cachedSpec;
}

export function loadAvroPdfCompatibilityCorpus() {
  return loadRows("pdf-spec-compatibility-corpus.tson", 3).map(([input, expected, category]) => ({
    input,
    expected,
    category
  }));
}

function loadRows(fileName, columns) {
  return parseTsonRows(fs.readFileSync(path.join(avroSpecDir, fileName), "utf8"), columns);
}
