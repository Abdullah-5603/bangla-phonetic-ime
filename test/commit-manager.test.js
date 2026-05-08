import test from "node:test";
import assert from "node:assert/strict";
import { createCommitManager } from "../src/engine/commit-manager.js";
import { createCompositionBuffer } from "../src/engine/composition-buffer.js";
import { createLatencyMonitor } from "../src/engine/latency-monitor.js";
import { createPreeditManager } from "../src/engine/preedit-manager.js";

test("commit manager moves preedit into committed text", () => {
  const buffer = createCompositionBuffer();
  const preedit = createPreeditManager();
  const latency = createLatencyMonitor();
  preedit.update("ami", [{ text: "আমি" }]);
  const manager = createCommitManager(buffer, preedit, latency);
  assert.equal(manager.commit(" "), "আমি ");
  assert.equal(buffer.getCommittedText(), "আমি ");
  assert.equal(preedit.getPreedit(), "");
});

