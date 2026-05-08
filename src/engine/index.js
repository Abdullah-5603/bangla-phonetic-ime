import { generateCandidates } from "./candidate-generator.js";
import { normalizeInput } from "./normalizer.js";
import { parsePunctuation } from "./parser.js";
import { getPhraseCandidatesAt, resolvePhraseAt } from "./phrase-resolver.js";
import { rankCandidates } from "./ranker.js";
import { tokenize } from "./tokenizer.js";
import { learnCorrection } from "./user-memory.js";

export { learnCorrection } from "./user-memory.js";

export function transliterate(input, options = {}) {
  const normalized = normalizeInput(input);
  const tokens = tokenize(normalized);
  const output = [];
  let index = 0;

  while (index < tokens.length) {
    const token = tokens[index];

    if (token.type === "word") {
      const phrase = resolvePhraseAt(tokens, index);

      if (phrase) {
        output.push(phrase.text);
        index = phrase.nextIndex;
        continue;
      }

      output.push(getCandidates(token.value, options)[0]?.text ?? token.value);
      index += 1;
      continue;
    }

    if (token.type === "punctuation") {
      output.push(parsePunctuation(token.value, options));
      index += 1;
      continue;
    }

    output.push(token.value);
    index += 1;
  }

  return output.join("");
}

export function getCandidates(input, options = {}) {
  const normalized = normalizeInput(input);
  const tokens = tokenize(normalized);
  const phraseCandidates = getPhraseCandidatesAt(tokens, 0).filter(
    (candidate) => Number(candidate.meta?.tokenLength || 0) === tokens.length
  );

  if (phraseCandidates.length > 0) {
    return phraseCandidates;
  }

  if (tokens.length === 1 && tokens[0].type === "word") {
    return rankCandidates(generateCandidates(tokens[0].value, options), {
      exactInput: tokens[0].value
    });
  }

  const candidate = {
    text: transliterate(normalized, options),
    score: 1000,
    source: "composed",
    meta: { input: normalized }
  };

  return [candidate];
}
