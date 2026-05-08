#!/usr/bin/env node

import { compareWithAvro } from "../src/adapters/compatibility/avro-compat.js";

export function main(argv = process.argv.slice(2)) {
  const input = argv.join(" ");
  if (!input) {
    console.log("Usage: node tools/compare-with-avro.js input");
    return;
  }
  const result = compareWithAvro(input);
  console.log(`Expected (Avro): ${result.expected ?? "unknown"}`);
  console.log(`Actual: ${result.actual}`);
  console.log(`Compatibility: ${result.passed === null ? "UNKNOWN" : result.passed ? "PASS" : "FAIL"}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
