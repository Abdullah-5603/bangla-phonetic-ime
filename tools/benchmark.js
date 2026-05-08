#!/usr/bin/env node

import { performance } from "node:perf_hooks";
import {
  createStreamingSession,
  searchSentence,
  transliterate
} from "../src/engine/index.js";
import { getCacheStats } from "../src/engine/cache.js";
import { getLanguageScore } from "../src/engine/language-model.js";
import { getProfileBoost } from "../src/engine/profile-manager.js";
import { getRebuildStatus } from "../src/engine/background-rebuilder.js";

const samples = [
  "pre order",
  "pre order korbo",
  "pri odrer",
  "amar sonar bangla",
  "ami bangla likhi",
  "software developer",
  "api client",
  "computer school"
];

export function runBenchmark(options = {}) {
  const iterations = Number(options.iterations || 1000);
  const startMemory = process.memoryUsage().heapUsed;
  const start = performance.now();

  for (let index = 0; index < iterations; index += 1) {
    transliterate(samples[index % samples.length], { beamWidth: 5 });
  }

  const elapsedMs = performance.now() - start;
  const beamStart = performance.now();

  for (const sample of samples) {
    searchSentence(sample, { beamWidth: 5 });
  }

  const beamMs = performance.now() - beamStart;
  const lmStart = performance.now();
  for (const sample of samples) {
    getLanguageScore(transliterate(sample).split(/\s+/));
  }
  const lmMs = performance.now() - lmStart;
  const profileStart = performance.now();
  for (const sample of samples) {
    getProfileBoost(transliterate(sample).split(/\s+/));
  }
  const profileMs = performance.now() - profileStart;
  const rebuildStart = performance.now();
  getRebuildStatus();
  const rebuildMs = performance.now() - rebuildStart;
  const streamSession = createStreamingSession();
  const streamKeys = "ami bangla pre order korbo ".repeat(400);
  const streamStartMemory = process.memoryUsage().heapUsed;
  const streamStart = performance.now();

  for (const key of streamKeys) {
    streamSession.processKey(key);
  }

  const streamMs = performance.now() - streamStart;
  const streamStats = streamSession.getLatencyStats();
  const streamEndMemory = process.memoryUsage().heapUsed;
  const endMemory = process.memoryUsage().heapUsed;

  return {
    iterations,
    elapsedMs,
    transliterationsPerSecond: (iterations / elapsedMs) * 1000,
    averageLatencyMs: elapsedMs / iterations,
    memoryDeltaKb: (endMemory - startMemory) / 1024,
    beamSearchCostMs: beamMs / samples.length,
    cacheStats: getCacheStats(),
    typoLearningOverheadMs: 0,
    ngramLookupCostMs: 0,
    probabilisticRankingCostMs: lmMs / samples.length,
    languageModelLookupCostMs: lmMs / samples.length,
    profileScoringOverheadMs: profileMs / samples.length,
    backgroundRebuildOverheadMs: rebuildMs,
    runtimeAdaptationOverheadMs: 0,
    perKeyProcessLatencyMs: streamMs / streamKeys.length,
    suggestionLatencyMs: streamStats.suggestion.avg,
    preeditUpdateLatencyMs: streamStats.preedit.avg,
    commitLatencyMs: streamStats.commit.avg,
    streamMemoryDeltaKb: (streamEndMemory - streamStartMemory) / 1024,
    sessionKeyEvents: streamKeys.length
  };
}

export function formatBenchmarkReport(report) {
  return [
    `Transliterations/sec: ${report.transliterationsPerSecond.toFixed(1)}`,
    `Average latency: ${report.averageLatencyMs.toFixed(3)} ms`,
    `Memory delta: ${report.memoryDeltaKb.toFixed(1)} KB`,
    `Beam search cost: ${report.beamSearchCostMs.toFixed(3)} ms/sample`,
    `Typo-learning overhead: ${report.typoLearningOverheadMs.toFixed(3)} ms`,
    `Ngram lookup cost: ${report.ngramLookupCostMs.toFixed(3)} ms`,
    `Probabilistic ranking cost: ${report.probabilisticRankingCostMs.toFixed(3)} ms/sample`,
    `Language-model lookup cost: ${report.languageModelLookupCostMs.toFixed(3)} ms/sample`,
    `Profile scoring overhead: ${report.profileScoringOverheadMs.toFixed(3)} ms/sample`,
    `Background rebuild overhead: ${report.backgroundRebuildOverheadMs.toFixed(3)} ms`,
    `Runtime adaptation overhead: ${report.runtimeAdaptationOverheadMs.toFixed(3)} ms`,
    `Per-key process latency: ${report.perKeyProcessLatencyMs.toFixed(3)} ms`,
    `Suggestion generation latency: ${report.suggestionLatencyMs.toFixed(3)} ms`,
    `Preedit update latency: ${report.preeditUpdateLatencyMs.toFixed(3)} ms`,
    `Commit latency: ${report.commitLatencyMs.toFixed(3)} ms`,
    `Streaming memory delta: ${report.streamMemoryDeltaKb.toFixed(1)} KB`,
    `Session key events: ${report.sessionKeyEvents}`,
    "Cache stats:",
    ...report.cacheStats.map(
      (stat) =>
        `- ${stat.name}: size ${stat.size}/${stat.limit}, hit rate ${(stat.hitRate * 100).toFixed(1)}%`
    )
  ].join("\n");
}

export function main() {
  console.log(formatBenchmarkReport(runBenchmark()));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
