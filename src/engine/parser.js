import { transliterateAvroSpec } from "./avro-spec-engine.js";
import { transliteratePunctuationText } from "./avro-punctuation-handler.js";

export function parseWord(word, options = {}) {
  return transliterateAvroSpec(word, options).text;
}

export function parsePunctuation(value, options = {}) {
  return transliteratePunctuationText(value, options);
}
