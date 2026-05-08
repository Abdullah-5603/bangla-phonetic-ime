import test from "node:test";
import assert from "node:assert/strict";
import { createIncrementalCandidateUpdater } from "../src/engine/incremental-candidates.js";

test("incremental candidate updater tracks last buffer and candidates", () => {
  const updater = createIncrementalCandidateUpdater();
  const candidates = updater.update("ami");
  const last = updater.getLast();
  assert.equal(candidates[0].text, "আমি");
  assert.equal(last.buffer, "ami");
});

