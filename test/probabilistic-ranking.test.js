import test from "node:test";
import assert from "node:assert/strict";
import { searchSentence } from "../src/engine/index.js";
import { scoreProbabilisticPath } from "../src/engine/probabilistic-ranker.js";

test("probabilistic ranking favors coherent sentence", () => {
  const result = searchSentence("pri odrer korbo");
  assert.equal(result.best.outputs.join(""), "প্রি অর্ডার করবো");
});

test("probabilistic path score includes language score", () => {
  const path = { outputs: ["প্রি", "অর্ডার", "করবো"] };
  const score = scoreProbabilisticPath(path, { normalized: "pre order korbo" });
  assert.ok(score.languageScore > 0);
});

