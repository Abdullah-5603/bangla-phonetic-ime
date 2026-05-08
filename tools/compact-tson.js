#!/usr/bin/env node

import fs from "node:fs";
import { parseTsonRows, writeTSON } from "../src/utils/tson.js";

export function compactTsonFile(filePath) {
  const rows = parseTsonRows(fs.readFileSync(filePath, "utf8"));
  writeTSON(filePath, rows, { header: "# compacted-tson" });
  return rows.length;
}

export function main(argv = process.argv.slice(2)) {
  const filePath = argv[0];
  if (!filePath) {
    console.log("Usage: node tools/compact-tson.js file.tson");
    return;
  }
  console.log(`Rows: ${compactTsonFile(filePath)}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

