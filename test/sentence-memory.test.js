import test from "node:test";
import assert from "node:assert/strict";
import { getSentenceBoost, getSentenceMemory } from "../src/engine/sentence-memory.js";

test("sentence memory loads stored sentence patterns", () => {
  const memory = getSentenceMemory("pre order korbo");

  assert.equal(memory.outputPattern, "প্রি অর্ডার করবো");
});

test("sentence memory provides boost for matching output", () => {
  assert.ok(getSentenceBoost("pre order korbo", "প্রি অর্ডার করবো") > 0);
});

