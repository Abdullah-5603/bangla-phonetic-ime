import test from "node:test";
import assert from "node:assert/strict";
import { evaluateCorpus, formatEvaluationReport } from "../src/engine/evaluator.js";

test("advanced evaluator reports top-k and category metrics", () => {
  const report = evaluateCorpus([
    { input: "odrer", expected: "অর্ডার", category: "Typo" },
    { input: "pre order korbo", expected: "প্রি অর্ডার করবো", category: "Mixed" }
  ]);
  const formatted = formatEvaluationReport(report);

  assert.equal(report.failed, 0);
  assert.match(formatted, /Top-3 Accuracy: 100\.0%/);
  assert.match(formatted, /Typo Recovery Accuracy: 100\.0%/);
});
