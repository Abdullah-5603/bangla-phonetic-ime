import test from "node:test";
import assert from "node:assert/strict";
import { getFuzzyKeys, normalizeInput } from "../src/engine/normalizer.js";

test("normalizeInput trims, lowercases, and collapses spaces", () => {
  assert.equal(normalizeInput("  Pri   orrDar  "), "pri orrdar");
});

test("normalizeInput preserves punctuation, numbers, and symbols", () => {
  assert.equal(normalizeInput("Order #1!"), "order #1!");
});

test("getFuzzyKeys adds light non-destructive variants", () => {
  assert.ok(getFuzzyKeys("orrDar").includes("ordar"));
});

