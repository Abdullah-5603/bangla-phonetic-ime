import test from "node:test";
import assert from "node:assert/strict";
import { requestBackgroundRebuild } from "../src/engine/background-rebuilder.js";
import {
  createSession,
  processKeystroke,
  resetSession
} from "../src/engine/ime-adapter-boundary.js";
import { getRuntimeStats } from "../src/engine/runtime-state.js";

test("background rebuild queue is runtime safe", () => {
  const status = requestBackgroundRebuild("test");
  assert.ok(status.queueLength >= 1);
  assert.ok(getRuntimeStats().rebuildQueue.length >= 1);
});

test("IME adapter boundary maintains a simple session", () => {
  const session = createSession();
  processKeystroke(session, "a");
  processKeystroke(session, "m");
  processKeystroke(session, "i");
  assert.equal(session.buffer, "ami");
  resetSession(session);
  assert.equal(session.buffer, "");
});

