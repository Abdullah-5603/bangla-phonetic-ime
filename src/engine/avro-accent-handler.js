import { matchRule } from "./avro-rule-matcher.js";

export function matchPrefixAccent(input, index, spec) {
  return matchRule(input, index, spec.accentPrefix);
}

export function matchSuffixAccent(input, index, spec) {
  return matchRule(input, index, spec.accentSuffix);
}
