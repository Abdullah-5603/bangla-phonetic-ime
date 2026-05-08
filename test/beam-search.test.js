import test from "node:test";
import assert from "node:assert/strict";
import { searchSentence } from "../src/engine/index.js";

test("beam search prefers coherent sentence path", () => {
  const result = searchSentence("pre order korbo", { beamWidth: 5 });

  assert.equal(result.best.outputs.join(""), "প্রি অর্ডার করবো");
  assert.ok(result.paths.every((path) => path.outputs.join("") !== "প্রে অর্দের করব"));
});

test("beam width is configurable", () => {
  const result = searchSentence("pre order korbo", { beamWidth: 2 });

  assert.equal(result.paths.length, 2);
});
