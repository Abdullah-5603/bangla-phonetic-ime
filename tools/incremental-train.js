#!/usr/bin/env node

import { appendLearningCase } from "../src/engine/incremental-trainer.js";

export function main(argv = process.argv.slice(2)) {
  const [input, expected, category = "User Learning"] = argv;
  if (!input || !expected) {
    console.log("Usage: node tools/incremental-train.js input expected [category]");
    return;
  }
  console.log(`Rows: ${appendLearningCase(input, expected, category)}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

