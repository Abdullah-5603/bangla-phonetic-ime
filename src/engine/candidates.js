import { transliterate } from "./index.js";

export function getCandidates(input, options = {}) {
  return [transliterate(input, options)];
}

