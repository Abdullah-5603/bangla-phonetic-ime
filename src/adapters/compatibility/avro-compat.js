import { transliterate } from "../../engine/index.js";
import {
  getAvroCandidate,
  getAvroCandidates,
  loadAvroCompatibilityCorpus
} from "./avro-rule-loader.js";

export function transliterateAvroCompatible(input) {
  const exact = getAvroCandidate(input);
  return exact?.text ?? transliterate(input, { mode: "avro-strict" });
}

export function getAvroCompatibilityCandidates(input) {
  return getAvroCandidates(input);
}

export function compareWithAvro(input, expected) {
  const avroExpected = expected ?? getExpectedFromCorpus(input);
  const actual = transliterateAvroCompatible(input);
  return {
    input,
    expected: avroExpected,
    actual,
    passed: avroExpected ? actual === avroExpected : null
  };
}

function getExpectedFromCorpus(input) {
  return loadAvroCompatibilityCorpus().find((item) => item.input === input)?.expected ?? null;
}
