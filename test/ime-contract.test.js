import test from "node:test";
import assert from "node:assert/strict";
import {
  commitCandidate,
  createInputSession,
  getCandidateList,
  getPreeditText,
  processKeyEvent,
  resetComposition
} from "../src/engine/ime-contract.js";

test("IME contract exposes adapter-neutral composition methods", () => {
  const session = createInputSession();
  processKeyEvent(session, { key: "a" });
  processKeyEvent(session, { key: "m" });
  processKeyEvent(session, { key: "i" });
  assert.equal(getPreeditText(session), "আমি");
  assert.ok(getCandidateList(session).length > 0);
  assert.equal(commitCandidate(session, 1), "আমি");
  resetComposition(session);
  assert.equal(getPreeditText(session), "");
});

