#!/usr/bin/env node

import fs from "node:fs";
import { mergeTSON, parseTsonRows, writeTSON } from "../src/utils/tson.js";

const memoryFiles = [
  "src/data/user/correction-memory.tson",
  "src/data/user/sentence-memory.tson",
  "src/data/user/learned-patterns.tson",
  "src/data/user/ranking-memory.tson"
];

export function exportMemory(outputPath) {
  const rows = mergeTSON(
    ...memoryFiles
      .filter((file) => fs.existsSync(file))
      .map((file) => parseTsonRows(fs.readFileSync(file, "utf8")))
  );

  writeTSON(outputPath, rows, { header: "# exported-memory" });
  return rows.length;
}

export function main(argv = process.argv.slice(2)) {
  const outputPath = argv[0] ?? "memory-export.tson";
  console.log(`Rows: ${exportMemory(outputPath)}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

