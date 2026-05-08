import test from "node:test";
import assert from "node:assert/strict";
import { explainAvroRules, transliterateAvroSpec } from "../src/engine/avro-spec-engine.js";

test("special atomic rule t`` is applied", () => {
  assert.equal(transliterateAvroSpec("t``", { mode: "avro-strict" }).text, "ত্");
});

test(":rule trace points to PDF TSON source", () => {
  const trace = explainAvroRules("Sh");
  assert.equal(trace[0].key, "Sh");
  assert.equal(trace[0].value, "ষ");
  assert.equal(trace[0].source, "pdf-spec-consonants.tson");
});
