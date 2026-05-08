#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseTsonRows, writeTSON } from "../src/utils/tson.js";

const corpusDir = "src/data/corpus";
const outputPath = "src/data/dictionary/frequency-table.tson";

export function buildFrequencyTable() {
  const counts = new Map();

  for (const file of fs.readdirSync(corpusDir).filter((name) => name.endsWith(".tson"))) {
    for (const [, expected] of parseTsonRows(fs.readFileSync(path.join(corpusDir, file), "utf8"), 3)) {
      for (const token of expected.split(/\s+/).filter(Boolean)) {
        counts.set(token, Number(counts.get(token) || 0) + 1);
      }
    }
  }

  const rows = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([token, count]) => [token, String(count * 1000)]);

  writeTSON(outputPath, rows, { header: "# output\tfrequency" });
  return rows.length;
}

export function main() {
  console.log(`Frequency rows: ${buildFrequencyTable()}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

