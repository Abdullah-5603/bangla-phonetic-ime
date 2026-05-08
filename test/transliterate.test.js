import test from "node:test";
import assert from "node:assert/strict";
import { transliterate } from "../src/engine/index.js";

const fixtures = [
  ["amar sonar bangla", "আমার সোনার বাংলা"],
  ["pre order", "প্রি অর্ডার"],
  ["pri order", "প্রি অর্ডার"],
  ["pri orrDar", "প্রি অর্ডার"],
  ["order", "অর্ডার"],
  ["computer", "কম্পিউটার"],
  ["school", "স্কুল"],
  ["ami bangla likhi", "আমি বাংলা লিখি"],
  ["dhonnobad", "ধন্যবাদ"],
  ["shikkha", "শিক্ষা"]
];

test("transliterate preserves v0.0.1 fixtures and v0.0.2 loanword cases", () => {
  for (const [input, expected] of fixtures) {
    assert.equal(transliterate(input), expected, input);
  }
});

test("transliterate preserves punctuation consistently as Bangla danda", () => {
  assert.equal(transliterate("pre order."), "প্রি অর্ডার।");
});

test("transliterate preserves numbers and unknown symbols safely", () => {
  assert.match(transliterate("version 1 #test"), /1/);
  assert.match(transliterate("version 1 #test"), /#/);
});

