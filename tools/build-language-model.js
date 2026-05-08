#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseTsonRows, writeTSON } from "../src/utils/tson.js";

const corpusDir = "src/data/corpus";
const outputPath = "src/data/dictionary/language-model.tson";

export function buildLanguageModel() {
  const counts = new Map();

  for (const file of fs.readdirSync(corpusDir).filter((name) => name.endsWith(".tson"))) {
    for (const [, expected] of parseTsonRows(fs.readFileSync(path.join(corpusDir, file), "utf8"), 3)) {
      const tokens = expected.split(/\s+/).filter(Boolean);
      for (const size of [1, 2, 3]) {
        for (let index = size - 1; index < tokens.length; index += 1) {
          const key = tokens.slice(index - size + 1, index + 1).join(" ");
          counts.set(key, Number(counts.get(key) || 0) + 1);
        }
      }
    }
  }

  const rows = [...counts.entries()].map(([phrase, count]) => [
    phrase,
    (Math.log(count + 1) * 4).toFixed(2),
    String(count)
  ]);
  writeTSON(outputPath, rows, { header: "# phrase\tlogScore\tcount" });
  return rows.length;
}

export function main() {
  console.log(`Language model rows: ${buildLanguageModel()}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

