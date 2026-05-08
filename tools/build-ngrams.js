#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseTsonRows, writeTSON } from "../src/utils/tson.js";

const corpusDir = "src/data/corpus";

export function buildNgrams() {
  const bigrams = new Map();
  const trigrams = new Map();

  for (const file of fs.readdirSync(corpusDir).filter((name) => name.endsWith(".tson"))) {
    for (const [, expected] of parseTsonRows(fs.readFileSync(path.join(corpusDir, file), "utf8"), 3)) {
      const tokens = expected.split(/\s+/).filter(Boolean);

      for (let index = 1; index < tokens.length; index += 1) {
        const key = `${tokens[index - 1]} ${tokens[index]}`;
        bigrams.set(key, Number(bigrams.get(key) || 0) + 1);
      }

      for (let index = 2; index < tokens.length; index += 1) {
        const key = `${tokens[index - 2]} ${tokens[index - 1]} ${tokens[index]}`;
        trigrams.set(key, Number(trigrams.get(key) || 0) + 1);
      }
    }
  }

  writeTSON(
    "src/data/dictionary/bigrams.tson",
    [...bigrams.entries()].map(([key, count]) => [key, String(count * 3000)]),
    { header: "# phrase\tscore" }
  );
  writeTSON(
    "src/data/dictionary/trigrams.tson",
    [...trigrams.entries()].map(([key, count]) => [key, String(count * 5000)]),
    { header: "# phrase\tscore" }
  );

  return { bigrams: bigrams.size, trigrams: trigrams.size };
}

export function main() {
  const result = buildNgrams();
  console.log(`Bigrams: ${result.bigrams}`);
  console.log(`Trigrams: ${result.trigrams}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

