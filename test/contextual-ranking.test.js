import test from "node:test";
import assert from "node:assert/strict";
import { scoreTransition } from "../src/engine/transition-scorer.js";
import { rankContextualCandidates } from "../src/engine/contextual-ranker.js";

test("scoreTransition applies positive bigram scoring", () => {
  const score = scoreTransition(
    { text: "প্রি", source: "loanword" },
    { text: "অর্ডার", source: "loanword" }
  );

  assert.ok(score >= 15000);
});

test("scoreTransition penalizes incoherent transitions", () => {
  const score = scoreTransition(
    { text: "প্রে", source: "phonetic" },
    { text: "অর্দের", source: "phonetic" }
  );

  assert.ok(score < 0);
});

test("rankContextualCandidates prefers আমি করবো over আমি করব", () => {
  const ranked = rankContextualCandidates(
    [
      { text: "করব", score: 9000, source: "dictionary" },
      { text: "করবো", score: 9000, source: "dictionary" }
    ],
    { text: "আমি", source: "dictionary" }
  );

  assert.equal(ranked[0].text, "করবো");
});

