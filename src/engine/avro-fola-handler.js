import { matchRule } from "./avro-rule-matcher.js";

export function matchFola(input, index, spec) {
  return matchRule(input, index, spec.fola);
}
