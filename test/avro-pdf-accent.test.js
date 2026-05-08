import test from "node:test";
import assert from "node:assert/strict";
import { transliterate } from "../src/engine/index.js";

test("accent/backtick prefix rules follow PDF table", () => {
  assert.equal(transliterate("`o", { mode: "avro-strict" }), "অ");
  assert.equal(transliterate("`a", { mode: "avro-strict" }), "আ");
  assert.equal(transliterate("`i", { mode: "avro-strict" }), "ই");
  assert.equal(transliterate("`I", { mode: "avro-strict" }), "ঈ");
});

test("accent/backtick suffix rules follow PDF table", () => {
  assert.equal(transliterate("a`", { mode: "avro-strict" }), "া");
  assert.equal(transliterate("ka`", { mode: "avro-strict" }), "কা");
  assert.equal(transliterate("ki`", { mode: "avro-strict" }), "কি");
  assert.equal(transliterate("kI`", { mode: "avro-strict" }), "কী");
  assert.equal(transliterate("o`", { mode: "avro-strict" }), "");
});
