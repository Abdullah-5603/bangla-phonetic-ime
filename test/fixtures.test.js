import test from "node:test";
import assert from "node:assert/strict";
import { transliterate } from "../src/engine/index.js";

const words = [
  ["ami", "আমি"],
  ["tumi", "তুমি"],
  ["bangla", "বাংলা"],
  ["amar", "আমার"],
  ["sonar", "সোনার"],
  ["shikkha", "শিক্ষা"],
  ["dhonnobad", "ধন্যবাদ"],
  ["bhalo", "ভালো"],
  ["kharap", "খারাপ"],
  ["manush", "মানুষ"],
  ["desh", "দেশ"],
  ["bhasha", "ভাষা"],
  ["boi", "বই"],
  ["kolom", "কলম"],
  ["computer", "কম্পিউটার"],
  ["school", "স্কুল"],
  ["raihan", "রাইহান"],
  ["abdullah", "আবদুল্লাহ"]
];

test("minimum MVP word fixtures", () => {
  for (const [input, expected] of words) {
    assert.equal(transliterate(input), expected, input);
  }
});

test("full sentence fixtures", () => {
  assert.equal(transliterate("ami bangla likhi"), "আমি বাংলা লিখি");
  assert.equal(transliterate("amar sonar bangla"), "আমার সোনার বাংলা");
});

test("preserves punctuation and maps ASCII full stop to Bangla danda by default", () => {
  assert.equal(transliterate("ami bangla likhi."), "আমি বাংলা লিখি।");
});

test("can keep ASCII full stops when requested", () => {
  assert.equal(
    transliterate("ami bangla likhi.", { bengaliFullStop: false }),
    "আমি বাংলা লিখি."
  );
});

test("preserves numbers and does not crash on English-like input", () => {
  assert.doesNotThrow(() => transliterate("version 1 test"));
  assert.match(transliterate("version 1 test"), /1/);
});

