import test from "node:test";
import assert from "node:assert/strict";
import { transliterate } from "../src/engine/index.js";

test("PDF vowel mappings are respected", () => {
  const fixtures = [
    ["o", "অ"],
    ["a", "আ"],
    ["i", "ই"],
    ["I", "ঈ"],
    ["ee", "ঈ"],
    ["u", "উ"],
    ["oo", "উ"],
    ["U", "ঊ"],
    ["rri", "ঋ"],
    ["e", "এ"],
    ["OI", "ঐ"],
    ["O", "ও"],
    ["OU", "ঔ"]
  ];

  for (const [input, expected] of fixtures) {
    assert.equal(transliterate(input, { mode: "avro-strict" }), expected, input);
  }
});
