import { findLongestRuleAt } from "./avro-case-sensitive-matcher.js";

export function sortRules(rules) {
  return [...rules].sort((a, b) => b.key.length - a.key.length);
}

export function matchRule(input, index, rules) {
  return findLongestRuleAt(input, index, rules);
}
