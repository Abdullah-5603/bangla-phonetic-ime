import test from "node:test";
import assert from "node:assert/strict";
import { getTypoBoost, getTypoCandidates } from "../src/engine/typo-learner.js";
import { getCandidates } from "../src/engine/index.js";

test("static typo patterns map odrer to order", () => {
  const candidates = getTypoCandidates("odrer");

  assert.equal(candidates[0].canonical, "order");
  assert.ok(candidates[0].confidence >= 0.8);
});

test("typo confidence contributes to candidate ranking", () => {
  assert.ok(getTypoBoost("odrer", "order") > 0);
  assert.equal(getCandidates("odrer")[0].text, "অর্ডার");
});

