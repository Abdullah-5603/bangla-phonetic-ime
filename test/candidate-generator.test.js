import test from "node:test";
import assert from "node:assert/strict";
import { generateCandidates } from "../src/engine/candidate-generator.js";
import { getCandidates } from "../src/engine/index.js";

test("generateCandidates returns loanword and phonetic candidates", () => {
  const candidates = generateCandidates("order");

  assert.equal(candidates[0].text, "অর্ডার");
  assert.ok(candidates.some((candidate) => candidate.source === "phonetic"));
});

test("getCandidates ranks order loanword first", () => {
  assert.equal(getCandidates("order")[0].text, "অর্ডার");
});

test("getCandidates ranks mixed-case correction first", () => {
  assert.equal(getCandidates("orrDar")[0].text, "অর্ডার");
});

