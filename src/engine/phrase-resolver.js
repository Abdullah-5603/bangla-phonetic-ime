import { phrases } from "../data/dictionary/phrases.js";
import { normalizeInput } from "./normalizer.js";
import { tokenize } from "./tokenizer.js";
import { getMemoryCorrection } from "./user-memory.js";
import { rankCandidates } from "./ranker.js";

const phraseEntries = Object.entries(phrases)
  .map(([input, candidates]) => ({
    input,
    tokens: tokenize(normalizeInput(input)),
    candidates
  }))
  .sort((a, b) => b.tokens.length - a.tokens.length || b.input.length - a.input.length);

export function getPhraseCandidatesAt(tokens, startIndex) {
  const candidates = [];
  const memoryCandidate = getMemoryPhraseCandidateAt(tokens, startIndex);

  if (memoryCandidate) {
    candidates.push(memoryCandidate);
  }

  for (const phrase of phraseEntries) {
    if (!matchesTokens(tokens, startIndex, phrase.tokens)) {
      continue;
    }

    for (const candidate of phrase.candidates) {
      candidates.push({
        ...candidate,
        meta: {
          ...(candidate.meta ?? {}),
          input: phrase.input,
          tokenLength: phrase.tokens.length
        }
      });
    }
  }

  return rankCandidates(candidates, {
    exactInput: tokensToInput(tokens.slice(startIndex))
  });
}

export function resolvePhraseAt(tokens, startIndex) {
  const candidates = getPhraseCandidatesAt(tokens, startIndex);
  const best = candidates[0];

  if (!best) {
    return null;
  }

  return {
    candidate: best,
    text: best.text,
    nextIndex: startIndex + Number(best.meta?.tokenLength || 1)
  };
}

function getMemoryPhraseCandidateAt(tokens, startIndex) {
  let buffer = "";

  for (let index = startIndex; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (!["word", "space", "punctuation"].includes(token.type)) {
      break;
    }

    buffer += token.value;
    const correction = getMemoryCorrection(buffer);

    if (correction) {
      return {
        ...correction,
        meta: {
          ...(correction.meta ?? {}),
          tokenLength: index - startIndex + 1
        }
      };
    }
  }

  return null;
}

function matchesTokens(tokens, startIndex, phraseTokens) {
  if (startIndex + phraseTokens.length > tokens.length) {
    return false;
  }

  return phraseTokens.every((phraseToken, offset) => {
    const token = tokens[startIndex + offset];
    return token?.type === phraseToken.type && token.value === phraseToken.value;
  });
}

function tokensToInput(tokens) {
  return tokens.map((token) => token.value).join("");
}

