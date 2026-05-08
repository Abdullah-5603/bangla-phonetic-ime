import test from "node:test";
import assert from "node:assert/strict";
import { rankCandidates } from "../src/engine/ranker.js";

test("rankCandidates sorts higher scores first", () => {
  const ranked = rankCandidates([
    { text: "অর্দের", score: 1200, source: "phonetic" },
    { text: "অর্ডার", score: 9500, source: "loanword" }
  ]);

  assert.equal(ranked[0].text, "অর্ডার");
});

test("rankCandidates penalizes repeated hasanta output", () => {
  const ranked = rankCandidates([
    { text: "ক্্", score: 1500, source: "phonetic" },
    { text: "ক", score: 1400, source: "phonetic" }
  ]);

  assert.equal(ranked[0].text, "ক");
});

