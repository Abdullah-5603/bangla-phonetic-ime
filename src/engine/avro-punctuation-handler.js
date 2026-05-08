const PUNCTUATION = new Map([[".", "।"]]);

export function transliteratePunctuation(char, options = {}) {
  if (options.bengaliFullStop === false) {
    return char;
  }

  return PUNCTUATION.get(char) ?? char;
}

export function transliteratePunctuationText(text, options = {}) {
  return Array.from(String(text ?? ""), (char) => transliteratePunctuation(char, options)).join("");
}
