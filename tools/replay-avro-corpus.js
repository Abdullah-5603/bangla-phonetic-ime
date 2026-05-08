#!/usr/bin/env node

import { loadAvroCompatibilityCorpus } from "../src/adapters/compatibility/avro-rule-loader.js";
import { compareWithAvro } from "../src/adapters/compatibility/avro-compat.js";

export function main() {
  for (const item of loadAvroCompatibilityCorpus()) {
    const result = compareWithAvro(item.input, item.expected);
    console.log(`${result.passed ? "PASS" : "FAIL"}\t${item.input}\t${result.actual}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
