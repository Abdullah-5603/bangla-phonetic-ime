import test from "node:test";
import assert from "node:assert/strict";
import { transliterate } from "../src/engine/index.js";
import { validateAvroCompatibility } from "../src/adapters/compatibility/avro-validator.js";
import { compareWithAvro } from "../src/adapters/compatibility/avro-compat.js";

test("Avro compatibility corpus passes", () => {
  const report = validateAvroCompatibility();
  assert.equal(report.failed, 0);
});

test("exact Avro edge cases take precedence", () => {
  assert.equal(transliterate("rri"), "ঋ");
  assert.equal(transliterate("khuje"), "খুঁজে");
  assert.equal(transliterate("kSh"), "ক্ষ");
});

test("compat compare reports pass for known corpus input", () => {
  const result = compareWithAvro("rri");
  assert.equal(result.expected, "ঋ");
  assert.equal(result.actual, "ঋ");
  assert.equal(result.passed, true);
});

