import test from "node:test";
import assert from "node:assert/strict";
import { transliterate } from "../src/engine/index.js";

test("y has PDF-sensitive behavior", () => {
  assert.equal(transliterate("y", { mode: "avro-strict" }), "ইয়");
  assert.equal(transliterate("ky", { mode: "avro-strict" }), "ক্য়");
  assert.equal(transliterate("Y", { mode: "avro-strict" }), "য়");
});
