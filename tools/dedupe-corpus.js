#!/usr/bin/env node

import fs from "node:fs";
import { parseTsonRows, writeTSON } from "../src/utils/tson.js";

export function dedupeCorpusFile(filePath) {
  const rows = parseTsonRows(fs.readFileSync(filePath, "utf8"), 3);
  const seen = new Map();

  for (const row of rows) {
    seen.set(row.join("\u0001"), row);
  }

  writeTSON(filePath, [...seen.values()], { header: "# input\texpected\tcategory" });
  return seen.size;
}

export function main(argv = process.argv.slice(2)) {
  const filePath = argv[0];

  if (!filePath) {
    console.log("Usage: node tools/dedupe-corpus.js corpus.tson");
    return;
  }

  console.log(`Rows: ${dedupeCorpusFile(filePath)}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

