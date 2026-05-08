#!/usr/bin/env node

import { buildFrequencyTable } from "./build-frequency-table.js";
import { buildNgrams } from "./build-ngrams.js";
import { validateTsonFiles } from "./validate-tson.js";

export function rebuildAll() {
  const frequencyRows = buildFrequencyTable();
  const ngrams = buildNgrams();
  const validation = validateTsonFiles();

  return { frequencyRows, ngrams, validation };
}

export function main() {
  const result = rebuildAll();
  console.log(`Frequency rows: ${result.frequencyRows}`);
  console.log(`Bigrams: ${result.ngrams.bigrams}`);
  console.log(`Trigrams: ${result.ngrams.trigrams}`);
  console.log(`TSON files checked: ${result.validation.length}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

