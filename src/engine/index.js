import { parsePunctuation, parseWord } from "./parser.js";
import { tokenize } from "./tokenizer.js";

export { getCandidates } from "./candidates.js";

export function transliterate(input, options = {}) {
  return tokenize(input)
    .map((token) => {
      if (token.type === "word") {
        return parseWord(token.value, options);
      }

      if (token.type === "punctuation") {
        return parsePunctuation(token.value, options);
      }

      return token.value;
    })
    .join("");
}

