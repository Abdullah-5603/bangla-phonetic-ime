export function startsWithAt(input, index, key) {
  return input.startsWith(key, index);
}

export function findLongestRuleAt(input, index, rules) {
  for (const rule of rules) {
    if (startsWithAt(input, index, rule.key)) {
      return rule;
    }
  }

  return null;
}
