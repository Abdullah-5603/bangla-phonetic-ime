import test from "node:test";
import assert from "node:assert/strict";
import {
  createCandidateState,
  getVisibleCandidates,
  selectCandidate,
  updateCandidates
} from "../src/adapters/protocol/candidate-protocol.js";

test("candidate protocol updates and selects candidates", () => {
  const state = createCandidateState(2);
  updateCandidates(state, [
    { text: "আমি", score: 1, source: "test" },
    { text: "আমিই", score: 2, source: "test" }
  ]);
  assert.equal(getVisibleCandidates(state).length, 2);
  assert.equal(selectCandidate(state, 1).text, "আমিই");
});

