import test from "node:test";
import assert from "node:assert/strict";
import { createLatencyMonitor } from "../src/engine/latency-monitor.js";

test("latency monitor records measurements", () => {
  const latency = createLatencyMonitor();
  const value = latency.measure("processKey", () => 42);
  assert.equal(value, 42);
  assert.equal(latency.stats().processKey.count, 1);
});

