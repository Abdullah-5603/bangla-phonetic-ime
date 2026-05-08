#!/usr/bin/env node

import fs from "node:fs";
import { parseTsonRows, stringifyTsonRows } from "../src/engine/tson.js";

export function buildTsonFromRows(rows, header = "# bangla-phonetic-ime tson v1") {
  return stringifyTsonRows(rows, header);
}

export function main(argv = process.argv.slice(2)) {
  const [inputPath, outputPath] = argv;

  if (!inputPath || !outputPath) {
    console.log("Usage: node tools/build-tson.js rows.tson output.tson");
    return;
  }

  const rows = parseTsonRows(fs.readFileSync(inputPath, "utf8"));
  fs.writeFileSync(outputPath, buildTsonFromRows(rows));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
