import test from "node:test";
import assert from "node:assert/strict";
import {
  commitBridgeCandidate,
  createBridgeSession,
  destroyBridgeSession,
  getIbusStatus,
  processBridgeKey,
  startBridge,
  stopBridge
} from "../src/adapters/ibus/bridge.js";

test("IBus bridge lifecycle is isolated and testable", () => {
  assert.equal(startBridge().state, "running");
  const { id, session } = createBridgeSession("test-session");
  processBridgeKey(id, "a");
  processBridgeKey(id, "m");
  processBridgeKey(id, "i");
  assert.equal(session.getPreedit(), "আমি");
  assert.equal(commitBridgeCandidate(id, 1), "আমি");
  assert.ok(getIbusStatus().sessionCount >= 1);
  destroyBridgeSession(id);
  assert.equal(stopBridge().state, "stopped");
});

