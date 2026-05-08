import {
  getFrequencyScore,
  getSentenceProbability,
  getTrigramScore
} from "./frequency-engine.js";
import { getSentenceBoost } from "./sentence-memory.js";
import { getTypoBoost } from "./typo-learner.js";
import { validateBanglaWord } from "./validator.js";

export function scoreAdaptiveNode(path, node, graph) {
  if (!node.meta?.lexical) {
    return 0;
  }

  let score = 0;
  score += getFrequencyScore(node.text);
  score += getTypoBoost(node.meta.input, node.meta.canonical ?? node.meta.fuzzyKey ?? "");
  score -= validateBanglaWord(node.text).penalty;

  const lexicalOutputs = [...path.outputs.filter(isBanglaOutput), node.text];

  if (lexicalOutputs.length >= 3) {
    score += getTrigramScore(
      lexicalOutputs.at(-3),
      lexicalOutputs.at(-2),
      lexicalOutputs.at(-1)
    );
  }

  const outputPattern = [...path.outputs, node.text].join("");
  score += getSentenceBoost(graph.normalized, outputPattern);

  return score;
}

export function scoreFinalSentence(path, graph) {
  const outputPattern = path.outputs.join("");
  return (
    getSentenceProbability(path.outputs.filter(isBanglaOutput)) +
    getSentenceBoost(graph.normalized, outputPattern)
  );
}

function isBanglaOutput(value) {
  return /[\u0980-\u09FF]/.test(value);
}

