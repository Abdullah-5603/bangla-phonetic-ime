import { matchRule } from "./avro-rule-matcher.js";

export function matchIndependentVowel(input, index, spec) {
  return matchRule(input, index, spec.vowels);
}

export function matchKar(input, index, spec) {
  return matchRule(input, index, spec.kars);
}
