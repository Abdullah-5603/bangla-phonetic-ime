const WORD_RE = /^[A-Za-z]+$/;
const NUMBER_RE = /^[0-9]+$/;
const WHITESPACE_RE = /^\s+$/;
const PUNCTUATION_RE = /^[.,!?;:'"()\-]+$/;

export function tokenize(input) {
  const tokens = [];
  const text = String(input ?? "");
  let index = 0;

  while (index < text.length) {
    const char = text[index];
    const type = getCharType(char);
    let value = char;
    index += 1;

    while (index < text.length && getCharType(text[index]) === type) {
      value += text[index];
      index += 1;
    }

    tokens.push({ type, value });
  }

  return tokens;
}

function getCharType(char) {
  if (/[A-Za-z]/.test(char)) return "word";
  if (/[0-9]/.test(char)) return "number";
  if (/\s/.test(char)) return "space";
  if (/[.,!?;:'"()\-]/.test(char)) return "punctuation";
  return "symbol";
}

export function isWordToken(token) {
  return WORD_RE.test(token.value);
}

export function isNumberToken(token) {
  return NUMBER_RE.test(token.value);
}

export function isWhitespaceToken(token) {
  return WHITESPACE_RE.test(token.value);
}

export function isPunctuationToken(token) {
  return PUNCTUATION_RE.test(token.value);
}
