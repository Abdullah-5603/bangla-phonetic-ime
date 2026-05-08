import { HASANTA } from "../data/rules/phonetic-rules.js";
import { matchConsonant, canTakeHasanta, resolveConsonantValue } from "./avro-consonant-handler.js";
import { matchPrefixAccent, matchSuffixAccent } from "./avro-accent-handler.js";
import { matchFola } from "./avro-fola-handler.js";
import { matchKarSign } from "./avro-kar-handler.js";
import { transliteratePunctuationText } from "./avro-punctuation-handler.js";
import { loadAvroPdfSpec } from "./avro-spec-parser.js";
import { matchRule } from "./avro-rule-matcher.js";
import { matchIndependentVowel } from "./avro-vowel-handler.js";

export function transliterateAvroSpec(input, options = {}) {
  const spec = loadAvroPdfSpec();
  const trace = [];
  const output = transliterateInput(String(input ?? ""), spec, trace, options);
  return options.includeTrace ? { text: output, trace } : { text: output };
}

export function explainAvroRules(input, options = {}) {
  return transliterateAvroSpec(input, { ...options, includeTrace: true }).trace;
}

function transliterateInput(input, spec, trace, options) {
  const transliterated = input.replace(/[A-Za-z`:^]+/g, (word) =>
    transliterateWord(word, spec, trace, options)
  );
  return transliteratePunctuationText(transliterated, options);
}

function transliterateWord(input, spec, trace, options) {
  let output = "";
  let index = 0;
  let previousWasConsonant = false;

  while (index < input.length) {
    const special = matchRule(input, index, spec.special);
    if (special) {
      output += special.value;
      trace.push(toTrace(input, index, special.key, special.value, "pdf-spec-special-rules.tson"));
      index += special.key.length;
      previousWasConsonant = false;
      continue;
    }

    const accentPrefix = matchPrefixAccent(input, index, spec);
    if (accentPrefix) {
      output += accentPrefix.value;
      trace.push(
        toTrace(input, index, accentPrefix.key, accentPrefix.value, "pdf-spec-special-rules.tson")
      );
      index += accentPrefix.key.length;
      previousWasConsonant = false;
      continue;
    }

    const vowel = matchIndependentVowel(input, index, spec);
    if (vowel) {
      if (previousWasConsonant && vowel.key === "o") {
        trace.push(toTrace(input, index, vowel.key, "(silent-o)", "pdf-spec-vowels.tson"));
        index += vowel.key.length;
        previousWasConsonant = false;
        continue;
      }

      output += vowel.value;
      trace.push(toTrace(input, index, vowel.key, vowel.value, "pdf-spec-vowels.tson"));
      index += vowel.key.length;
      previousWasConsonant = false;
      continue;
    }

    const consonant = matchConsonant(input, index, spec);
    if (consonant) {
      const consonantValue = resolveConsonantValue(consonant, {
        wordStart: index === 0
      });
      output += consonantValue;
      trace.push(
        toTrace(input, index, consonant.key, consonantValue, "pdf-spec-consonants.tson")
      );
      index += consonant.key.length;

      const suffixAccent = matchSuffixAccent(input, index, spec);
      if (suffixAccent) {
        output += suffixAccent.value;
        trace.push(
          toTrace(input, index, suffixAccent.key, suffixAccent.value, "pdf-spec-special-rules.tson")
        );
        index += suffixAccent.key.length;
        previousWasConsonant = false;
        continue;
      }

      const kar = matchKarSign(input, index, spec);
      if (kar) {
        output += kar.value;
        trace.push(toTrace(input, index, kar.key, kar.value, "pdf-spec-kars.tson"));
        index += kar.key.length;
        previousWasConsonant = false;
        continue;
      }

      const fola = matchFola(input, index, spec);
      if (fola) {
        output += fola.value;
        trace.push(toTrace(input, index, fola.key, fola.value, "pdf-spec-fola.tson"));
        index += fola.key.length;
        previousWasConsonant = false;
        continue;
      }

      const nextConsonant = matchConsonant(input, index, spec);
      if (nextConsonant && canTakeHasanta(consonant) && canTakeHasanta(nextConsonant)) {
        output += HASANTA;
      }

      previousWasConsonant = true;
      continue;
    }

    output += transliteratePunctuationText(input[index], options);
    index += 1;
    previousWasConsonant = false;
  }

  return output;
}

function toTrace(input, index, key, value, source) {
  return {
    input,
    index,
    key,
    value,
    source
  };
}
