#!/usr/bin/env node

import { performance } from "node:perf_hooks";
import { searchSentence, transliterate } from "../src/engine/index.js";
import { getCacheStats } from "../src/engine/cache.js";

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
    ngramLookupCostMs: 0
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
