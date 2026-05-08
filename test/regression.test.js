import test from "node:test";
import assert from "node:assert/strict";
import { evaluateCorpus, loadCorpus } from "../src/engine/evaluation.js";
import { transliterate } from "../src/engine/index.js";

test("v0.0.3 regressions remain fixed", () => {
  const report = evaluateCorpus(loadCorpus(["regressions.tson"]));

  assert.equal(report.failed, 0);
});

test("complex loanword regression uses fuzzy contextual path", () => {
  assert.equal(transliterate("pri odrer"), "প্রি অর্ডার");
});
