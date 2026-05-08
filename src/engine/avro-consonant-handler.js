import { matchRule } from "./avro-rule-matcher.js";

export function matchConsonant(input, index, spec) {
  return matchRule(input, index, spec.consonants);
}

export function resolveConsonantValue(rule, context = {}) {
  if (!rule) return null;

  if (rule.key === "y" && context.wordStart) {
    return "ইয়";
  }

  return rule.value;
}

export function canTakeHasanta(rule) {
  return Boolean(rule?.joinable);
}
