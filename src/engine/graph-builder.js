import { generateCandidates } from "./candidate-generator.js";
import { normalizeInput } from "./normalizer.js";
import { parsePunctuation } from "./parser.js";
import { getPhraseCandidatesAt } from "./phrase-resolver.js";
import { rankCandidates } from "./ranker.js";
import { tokenize } from "./tokenizer.js";

const DEFAULT_CANDIDATE_LIMIT = 5;

export function buildCandidateGraph(input, options = {}) {
  const normalized = normalizeInput(input);
  const tokens = tokenize(normalized);
  const edges = new Map();
  const candidateLimit = Number(options.candidateLimit || DEFAULT_CANDIDATE_LIMIT);

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const nodes = [];

    if (token.type === "word") {
      const phraseCandidates = getPhraseCandidatesAt(tokens, index)
        .filter((candidate) => Number(candidate.meta?.tokenLength || 0) > 1)
        .slice(0, candidateLimit);

      for (const candidate of phraseCandidates) {
        nodes.push(toNode(candidate, index, Number(candidate.meta.tokenLength), true));
      }

      const wordCandidates = rankCandidates(generateCandidates(token.value, options), {
        exactInput: token.value
      }).slice(0, candidateLimit);

      for (const candidate of wordCandidates) {
        nodes.push(toNode(candidate, index, 1, true));
      }
    } else if (token.type === "punctuation") {
      nodes.push(passThroughNode(parsePunctuation(token.value, options), token, index));
    } else {
      nodes.push(passThroughNode(token.value, token, index));
    }

    edges.set(index, uniqueNodes(nodes));
  }

  return { input, normalized, tokens, edges };
}

function toNode(candidate, index, tokenLength, lexical) {
  return {
    text: candidate.text,
    score: Number(candidate.score || 0),
    source: candidate.source,
    tokenLength,
    index,
    meta: {
      ...(candidate.meta ?? {}),
      lexical
    }
  };
}

function passThroughNode(text, token, index) {
  return {
    text,
    score: 0,
    source: token.type,
    tokenLength: 1,
    index,
    meta: {
      input: token.value,
      lexical: false
    }
  };
}

function uniqueNodes(nodes) {
  const seen = new Map();

  for (const node of nodes) {
    const key = `${node.text}:${node.tokenLength}:${node.source}`;
    const previous = seen.get(key);

    if (!previous || node.score > previous.score) {
      seen.set(key, node);
    }
  }

  return [...seen.values()].sort((a, b) => b.score - a.score);
}

