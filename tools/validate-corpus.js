#!/usr/bin/env node

import { loadCorpus } from "../src/engine/evaluation.js";

export function validateCorpus() {
  const cases = loadCorpus();
  const errors = [];

  cases.forEach((item, index) => {
    for (const key of ["input", "expected", "category"]) {
      if (!item[key] || typeof item[key] !== "string") {
        errors.push(`Case ${index + 1} is missing string field: ${key}`);
      }
    }
  });

  return errors;
}

export function main() {
  const errors = validateCorpus();

  if (errors.length === 0) {
    console.log("Corpus valid.");
    return;
  }

  console.log(errors.join("\n"));
  process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

