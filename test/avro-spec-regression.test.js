import test from "node:test";
import assert from "node:assert/strict";
import { getCandidates, transliterate } from "../src/engine/index.js";
import { validateAvroCompatibility } from "../src/adapters/compatibility/avro-validator.js";

test("avro strict keeps case-sensitive distinctions", () => {
  assert.equal(transliterate("O", { mode: "avro-strict" }), "ও");
  assert.equal(transliterate("o", { mode: "avro-strict" }), "অ");
  assert.equal(transliterate("Sh", { mode: "avro-strict" }), "ষ");
  assert.equal(transliterate("S", { mode: "avro-strict" }), "শ");
});

test("strict mode does not prioritize custom aliases", () => {
  const strictTop = getCandidates("colO zay, ghure asshi", { mode: "avro-strict" })[0];
  assert.equal(strictTop.source, "avro-pdf");
});

test("smart mode exposes smart candidates while retaining avro exact output", () => {
  const exact = transliterate("order", { mode: "avro-strict" });
  const smart = getCandidates("order", { mode: "avro-smart" });
  assert.ok(smart.some((item) => item.source === "avro-pdf" && item.text === exact));
  assert.ok(smart.some((item) => item.source !== "avro-pdf"));
});

test("pdf compatibility corpus executes", () => {
  const report = validateAvroCompatibility();
  assert.ok(report.total > 0);
});
