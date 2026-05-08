import test from "node:test";
import assert from "node:assert/strict";
import { transliterate } from "../src/engine/index.js";
import { parseWord } from "../src/engine/parser.js";
import { getCandidates } from "../src/engine/candidates.js";

test("exports a transliterate API", () => {
  assert.equal(transliterate("ami bangla likhi"), "আমি বাংলা লিখি");
});

test("uses longest-match-first consonant parsing", () => {
  assert.equal(parseWord("shikkha"), "শিক্ষা");
});

test("applies vowel signs after consonants", () => {
  assert.equal(parseWord("ki"), "কি");
  assert.equal(parseWord("kee"), "কী");
  assert.equal(parseWord("ku"), "কু");
  assert.equal(parseWord("ke"), "কে");
  assert.equal(parseWord("ko"), "কো");
  assert.equal(parseWord("ka"), "কা");
});

test("uses independent vowels at word boundaries", () => {
  assert.equal(parseWord("ami"), "আমি");
  assert.equal(parseWord("ek"), "এক");
  assert.equal(parseWord("onek"), "অনেক");
});

test("returns simple MVP candidates", () => {
  assert.deepEqual(getCandidates("ami"), ["আমি"]);
});

