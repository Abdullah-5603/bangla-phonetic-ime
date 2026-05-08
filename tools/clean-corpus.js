#!/usr/bin/env node

import fs from "node:fs";
import { normalizeInput } from "../src/engine/normalizer.js";
import { parseTsonRows, writeTSON } from "../src/utils/tson.js";

export function cleanCorpusFile(filePath) {
  const rows = parseTsonRows(fs.readFileSync(filePath, "utf8"), 3)
    .map(([input, expected, category]) => [normalizeInput(input), expected.trim(), category.trim()])
    .filter(([input, expected, category]) => input && expected && category);

  writeTSON(filePath, rows, { header: "# input\texpected\tcategory" });
  return rows.length;
}

export function main(argv = process.argv.slice(2)) {
  const filePath = argv[0];

  if (!filePath) {
    console.log("Usage: node tools/clean-corpus.js corpus.tson");
    return;
  }

  console.log(`Rows: ${cleanCorpusFile(filePath)}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

