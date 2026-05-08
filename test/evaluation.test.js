import test from "node:test";
import assert from "node:assert/strict";
import {
  evaluateCorpus,
  formatEvaluationReport,
  loadCorpus
} from "../src/engine/evaluation.js";

test("evaluateCorpus calculates accuracy and failed cases", () => {
  const report = evaluateCorpus([
    { input: "order", expected: "অর্ডার", category: "Loanwords" },
    { input: "order", expected: "ভুল", category: "Loanwords" }
  ]);

  assert.equal(report.total, 2);
  assert.equal(report.passed, 1);
  assert.equal(report.failedCases.length, 1);
});

test("full corpus currently passes", () => {
  const report = evaluateCorpus(loadCorpus());

  assert.equal(report.failed, 0);
  assert.match(formatEvaluationReport(report), /Total Accuracy: 100\.0%/);
});

