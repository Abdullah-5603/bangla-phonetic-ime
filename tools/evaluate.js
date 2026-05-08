#!/usr/bin/env node

import {
  formatEvaluationReport,
  runEvaluation
} from "../src/engine/evaluation.js";

export function main() {
  const report = runEvaluation();
  console.log(formatEvaluationReport(report));

  if (report.failed > 0) {
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

