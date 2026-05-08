import { transliterateAvroSpec } from "../../engine/avro-spec-engine.js";
import { loadAvroPdfCompatibilityCorpus } from "../../engine/avro-spec-parser.js";

export function loadAvroRules() {
  return new Map();
}

export function loadAvroExceptions() {
  return new Map();
}

export function loadAvroAutocorrect() {
  return new Map();
}

export function loadAvroCompatibilityCorpus() {
  return loadAvroPdfCompatibilityCorpus();
}

export function getAvroCandidate(input) {
  const key = String(input ?? "");
  return {
    text: transliterateAvroSpec(key, { mode: "avro-strict" }).text,
    score: 50000,
    source: "avro-pdf",
    meta: { input: key }
  };
}

export function getAvroCandidates(input) {
  const candidate = getAvroCandidate(input);
  return candidate ? [candidate] : [];
}
