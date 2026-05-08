#!/usr/bin/env node

import fs from "node:fs";
import { normalizeInput } from "../src/engine/normalizer.js";
import { parseTsonRows, writeTSON } from "../src/utils/tson.js";

export function importCorpus(inputPath, outputPath, category = "Imported") {
  const source = fs.readFileSync(inputPath, "utf8");
  const rows = inputPath.endsWith(".tson")
    ? parseTsonRows(source).map((row) =>
        row.length === 3 ? row : [normalizeInput(row[0] ?? ""), row[1] ?? "", category]
      )
    : source
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => [normalizeInput(line), line, category]);

  writeTSON(outputPath, rows, { header: "# input\texpected\tcategory" });
  return rows.length;
}

export function main(argv = process.argv.slice(2)) {
  const [inputPath, outputPath, category] = argv;

  if (!inputPath || !outputPath) {
    console.log("Usage: node tools/import-corpus.js input.tson output.tson [category]");
    return;
  }

  console.log(`Imported: ${importCorpus(inputPath, outputPath, category)}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

