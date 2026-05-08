import test from "node:test";
import assert from "node:assert/strict";
import { runBenchmark } from "../tools/benchmark.js";

test("benchmark reports latency and cache stats", () => {
  const report = runBenchmark({ iterations: 50 });

  assert.ok(report.averageLatencyMs < 5);
  assert.ok(Array.isArray(report.cacheStats));
});
