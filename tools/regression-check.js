#!/usr/bin/env node

import {
  evaluateCorpus,
  formatEvaluationReport,
  loadCorpus
} from "../src/engine/evaluation.js";

export function main() {
  const report = evaluateCorpus(loadCorpus(["regressions.tson"]));
  console.log(formatEvaluationReport(report));

  if (report.failed > 0) {
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
