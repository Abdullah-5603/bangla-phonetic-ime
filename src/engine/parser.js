import {
  HASANTA,
  consonantRules,
  punctuationMap,
  vowelRules
} from "../data/rules/phonetic-rules.js";

const sortedVowels = sortRules(vowelRules);
const sortedConsonants = sortRules(consonantRules);

export function parseWord(word, options = {}) {
  const source = String(word ?? "");
  const normalized = source.toLowerCase();

  let output = "";
  let index = 0;

  while (index < normalized.length) {
    const vowel = findRule(normalized, index, sortedVowels);
    if (vowel) {
      output += vowel.independent;
      index += vowel.key.length;
      continue;
    }

    const consonant = findRule(normalized, index, sortedConsonants);
    if (consonant) {
      const nextIndex = index + consonant.key.length;
      const nextVowel = findRule(normalized, nextIndex, sortedVowels);

      output += consonant.value;

      if (nextVowel) {
        output += nextVowel.sign;
        index = nextIndex + nextVowel.key.length;
        continue;
      }

      const nextConsonant = findRule(normalized, nextIndex, sortedConsonants);
      if (nextConsonant && shouldJoinConsonants(consonant, nextConsonant)) {
        output += HASANTA;
      }

      index = nextIndex;
      continue;
    }

    output += source[index];
    index += 1;
  }

  return output;
}

export function parsePunctuation(value, options = {}) {
  if (options.bengaliFullStop === false) {
    return value;
  }

  return Array.from(value, (char) => punctuationMap.get(char) ?? char).join("");
}

function sortRules(rules) {
  return rules
    .map(([key, independentOrValue, sign]) => ({
      key,
      value: independentOrValue,
      independent: independentOrValue,
      sign
    }))
    .sort((a, b) => b.key.length - a.key.length);
}

function findRule(input, index, rules) {
  return rules.find((rule) => input.startsWith(rule.key, index));
}

function shouldJoinConsonants(current, next) {
  if (current.value === "ং") return false;
  if (next.value === "ং") return false;
  return true;
}
