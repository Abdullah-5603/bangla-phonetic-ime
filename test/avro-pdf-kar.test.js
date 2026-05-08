import test from "node:test";
import assert from "node:assert/strict";
import { transliterate } from "../src/engine/index.js";

test("PDF kar rules apply after consonants", () => {
  const fixtures = [
    ["ka", "কা"],
    ["ki", "কি"],
    ["kI", "কী"],
    ["kee", "কী"],
    ["ku", "কু"],
    ["koo", "কু"],
    ["kU", "কূ"],
    ["krri", "কৃ"],
    ["ke", "কে"],
    ["kOI", "কৈ"],
    ["kO", "কো"],
    ["kOU", "কৌ"]
  ];

  for (const [input, expected] of fixtures) {
    assert.equal(transliterate(input, { mode: "avro-strict" }), expected, input);
  }
});
