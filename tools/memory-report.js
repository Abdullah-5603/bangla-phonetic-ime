#!/usr/bin/env node

import { getRuntimeStats } from "../src/engine/runtime-state.js";
import { getSentenceMemoryStats } from "../src/engine/sentence-memory.js";
import { getTypoStats } from "../src/engine/typo-learner.js";
import { getLanguageModelStats } from "../src/engine/language-model.js";

export function main() {
  const runtime = getRuntimeStats();
  const sentence = getSentenceMemoryStats();
  const typo = getTypoStats();
  const lm = getLanguageModelStats();
  console.log(`active profile: ${runtime.activeProfile}`);
  console.log(`sentence memories: ${sentence.sentenceMemories}`);
  console.log(`typo patterns: ${typo.staticPatterns + typo.learnedPatterns}`);
  console.log(`language model entries: ${lm.entries}`);
  console.log(`cache count: ${runtime.cacheStats.length}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

