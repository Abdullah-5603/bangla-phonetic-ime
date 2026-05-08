import test from "node:test";
import assert from "node:assert/strict";
import { transliterate } from "../src/engine/index.js";

test("PDF consonant mappings are respected", () => {
  const fixtures = [
    ["k", "ক"],
    ["kh", "খ"],
    ["g", "গ"],
    ["gh", "ঘ"],
    ["Ng", "ঙ"],
    ["c", "চ"],
    ["ch", "ছ"],
    ["j", "জ"],
    ["jh", "ঝ"],
    ["NG", "ঞ"],
    ["T", "ট"],
    ["Th", "ঠ"],
    ["D", "ড"],
    ["Dh", "ঢ"],
    ["N", "ণ"],
    ["t", "ত"],
    ["th", "থ"],
    ["d", "দ"],
    ["dh", "ধ"],
    ["n", "ন"],
    ["p", "প"],
    ["ph", "ফ"],
    ["f", "ফ"],
    ["b", "ব"],
    ["bh", "ভ"],
    ["v", "ভ"],
    ["m", "ম"],
    ["z", "য"],
    ["r", "র"],
    ["l", "ল"],
    ["sh", "শ"],
    ["S", "শ"],
    ["Sh", "ষ"],
    ["s", "স"],
    ["h", "হ"],
    ["R", "ড়"],
    ["Rh", "ঢ়"],
    ["Y", "য়"],
    ["ng", "ং"],
    [":", "ঃ"],
    ["^", "ঁ"],
    ["J", "জ়"]
  ];

  for (const [input, expected] of fixtures) {
    assert.equal(transliterate(input, { mode: "avro-strict" }), expected, input);
  }
});
