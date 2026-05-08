import test from "node:test";
import assert from "node:assert/strict";
import { runBenchmark } from "../tools/benchmark.js";

test("benchmark includes v0.0.6 probabilistic metrics", () => {
  const report = runBenchmark({ iterations: 50 });
  assert.ok(report.probabilisticRankingCostMs >= 0);
  assert.ok(report.languageModelLookupCostMs >= 0);
  assert.ok(report.profileScoringOverheadMs >= 0);
});

