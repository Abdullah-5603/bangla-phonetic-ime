import test from "node:test";
import assert from "node:assert/strict";
import {
  estimatePerplexity,
  getLanguageBreakdown,
  getLanguageModelStats,
  getLanguageScore
} from "../src/engine/language-model.js";

test("language model scores known sentence above malformed sentence", () => {
  assert.ok(
    getLanguageScore(["প্রি", "অর্ডার", "করবো"]) >
      getLanguageScore(["প্রে", "অর্দের", "কোর্বো"])
  );
});

test("language model exposes breakdown and stats", () => {
  const breakdown = getLanguageBreakdown("প্রি অর্ডার করবো");
  const stats = getLanguageModelStats();
  assert.ok(breakdown.finalScore > 0);
  assert.ok(stats.entries > 0);
});

test("perplexity estimator returns finite positive value", () => {
  assert.ok(estimatePerplexity([{ expected: "প্রি অর্ডার করবো" }]) > 0);
});

