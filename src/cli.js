#!/usr/bin/env node

import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  getCandidates,
  getLanguageBreakdown,
  getLanguageModelStats,
  getProfile,
  getRuntimeStats,
  learn,
  learnCorrection,
  listProfiles,
  searchSentence,
  setProfile,
  transliterate
} from "./engine/index.js";
import { clearMemory, loadMemory } from "./engine/user-memory.js";
import {
  formatEvaluationReport,
  runEvaluation
} from "./engine/evaluation.js";
import {
  formatBenchmarkReport,
  runBenchmark
} from "../tools/benchmark.js";
import { getCacheStats } from "./engine/cache.js";
import { getBigramScore, getTrigramScore } from "./engine/frequency-engine.js";
import { getSentenceMemoryStats } from "./engine/sentence-memory.js";
import { getTypoCandidates, getTypoStats } from "./engine/typo-learner.js";
import { getRebuildStatus } from "./engine/background-rebuilder.js";

export async function main(argv = process.argv.slice(2)) {
  if (argv.includes("--help") || argv.includes("-h")) {
    printHelp();
    return;
  }

  if (argv.includes("--interactive") || argv.includes("-i")) {
    await runInteractive({ yes: argv.includes("--yes") });
    return;
  }

  const text = argv.filter((arg) => arg !== "--yes").join(" ");
  if (!text) {
    printHelp();
    return;
  }

  console.log(transliterate(text));
}

async function runInteractive(options = {}) {
  const rl = createInterface({ input, output });

  try {
    while (true) {
      const line = await rl.question("> ");
      const command = line.trim();

      if (command === ":q" || command === ":quit") {
        break;
      }

      if (command.startsWith(":candidates ")) {
        printCandidates(command.slice(":candidates ".length));
        continue;
      }

      if (command.startsWith(":beam ")) {
        printBeam(command.slice(":beam ".length));
        continue;
      }

      if (command === ":eval") {
        const report = runEvaluation();
        console.log(formatEvaluationReport(report));
        continue;
      }

      if (command === ":benchmark") {
        console.log(formatBenchmarkReport(runBenchmark({ iterations: 300 })));
        continue;
      }

      if (command.startsWith(":fix ")) {
        saveCorrection(command.slice(":fix ".length));
        continue;
      }

      if (command.startsWith(":learn ")) {
        learnFromCommand(command.slice(":learn ".length));
        continue;
      }

      if (command === ":memory-stats") {
        printMemoryStats();
        continue;
      }

      if (command === ":profiles") {
        console.log(listProfiles().join("\n"));
        continue;
      }

      if (command.startsWith(":profile ")) {
        switchProfile(command.slice(":profile ".length).trim());
        continue;
      }

      if (command.startsWith(":lm ")) {
        printLanguageModel(command.slice(":lm ".length));
        continue;
      }

      if (command === ":perplexity") {
        const stats = getLanguageModelStats();
        console.log(`language model entries: ${stats.entries}`);
        console.log(`quadgrams: ${stats.quadgrams}`);
        continue;
      }

      if (command === ":runtime-stats") {
        printRuntimeStats();
        continue;
      }

      if (command === ":rebuild-status") {
        printRebuildStatus();
        continue;
      }

      if (command.startsWith(":ngram ")) {
        printNgram(command.slice(":ngram ".length));
        continue;
      }

      if (command.startsWith(":explain ")) {
        printExplain(command.slice(":explain ".length));
        continue;
      }

      if (command === ":memory") {
        printMemory();
        continue;
      }

      if (command === ":clear-memory" || command === ":clear-memory --yes") {
        const confirmed =
          options.yes ||
          command.endsWith("--yes") ||
          (await rl.question("Clear user correction memory? type yes: ")) === "yes";

        if (confirmed) {
          clearMemory();
          console.log("Memory cleared.");
        } else {
          console.log("Memory unchanged.");
        }
        continue;
      }

      console.log(transliterate(line));
    }
  } finally {
    rl.close();
  }
}

function printBeam(inputText) {
  const result = searchSentence(inputText, { beamWidth: 5 });

  if (result.paths.length === 0) {
    console.log("No beam paths.");
    return;
  }

  result.paths.forEach((path, index) => {
    console.log(`${index + 1}. ${path.outputs.join("")}   score: ${Math.round(path.score)}`);
  });
}

function printCandidates(inputText) {
  const candidates = getCandidates(inputText);

  if (candidates.length === 0) {
    console.log("No candidates.");
    return;
  }

  candidates.forEach((candidate, index) => {
    console.log(
      `${index + 1}. ${candidate.text}    score: ${candidate.score}    source: ${candidate.source}`
    );
  });
}

function saveCorrection(commandText) {
  const separatorIndex = commandText.indexOf("=");

  if (separatorIndex === -1) {
    console.log("Usage: :fix input text = বাংলা সংশোধন");
    return;
  }

  const source = commandText.slice(0, separatorIndex).trim();
  const target = commandText.slice(separatorIndex + 1).trim();

  try {
    learnCorrection(source, target);
    console.log(`Saved: ${source} => ${target}`);
  } catch (error) {
    console.log(error.message);
  }
}

function learnFromCommand(commandText) {
  const separatorIndex = commandText.indexOf("=");

  if (separatorIndex === -1) {
    console.log("Usage: :learn input text = বাংলা output");
    return;
  }

  const source = commandText.slice(0, separatorIndex).trim();
  const target = commandText.slice(separatorIndex + 1).trim();
  const result = learn(source, target, { context: "cli" });
  console.log(`Learned: ${source} => ${target}`);
  console.log(`Sentence memory count: ${result.sentence?.count ?? 0}`);
  console.log(`Typo patterns learned: ${result.typoPatterns.length}`);
}

function printMemoryStats() {
  const corrections = Object.keys(loadMemory()).length;
  const sentenceStats = getSentenceMemoryStats();
  const typoStats = getTypoStats();

  console.log(`learned corrections: ${corrections}`);
  console.log(`sentence memories: ${sentenceStats.sentenceMemories}`);
  console.log(`typo patterns: ${typoStats.staticPatterns + typoStats.learnedPatterns}`);
  console.log("cache sizes:");

  for (const stat of getCacheStats()) {
    console.log(
      `- ${stat.name}: size ${stat.size}/${stat.limit}, hit rate ${(stat.hitRate * 100).toFixed(1)}%`
    );
  }
}

function switchProfile(profileName) {
  try {
    setProfile(profileName);
    console.log(`active profile: ${getProfile()}`);
  } catch (error) {
    console.log(error.message);
  }
}

function printLanguageModel(phrase) {
  const breakdown = getLanguageBreakdown(phrase);
  console.log(`Unigram: ${breakdown.unigram.toFixed(2)}`);
  console.log(`Bigram: ${breakdown.bigram.toFixed(2)}`);
  console.log(`Trigram: ${breakdown.trigram.toFixed(2)}`);
  console.log(`Quadgram: ${breakdown.quadgram.toFixed(2)}`);
  console.log(`Final LM Score: ${breakdown.finalScore.toFixed(2)}`);
}

function printRuntimeStats() {
  const stats = getRuntimeStats();
  const typoStats = getTypoStats();
  const sentenceStats = getSentenceMemoryStats();
  console.log(`active profile: ${stats.activeProfile}`);
  console.log(`learned typo count: ${typoStats.learnedPatterns}`);
  console.log(`sentence memory count: ${sentenceStats.sentenceMemories}`);
  console.log(`adaptation events: ${stats.adaptationEvents}`);
  console.log(`rebuild queue: ${stats.rebuildQueue.length}`);
  console.log("cache usage:");
  for (const stat of stats.cacheStats) {
    console.log(`- ${stat.name}: ${stat.size}/${stat.limit}`);
  }
}

function printRebuildStatus() {
  const status = getRebuildStatus();
  console.log(`queue length: ${status.queueLength}`);
  console.log(`last rebuild: ${status.lastRebuildAt ?? "never"}`);
  for (const item of status.queue) {
    console.log(`- ${item.task}: ${item.status}`);
  }
}

function printNgram(phrase) {
  const parts = phrase.trim().split(/\s+/);

  if (parts.length === 2) {
    console.log(`bigram score: ${getBigramScore(parts[0], parts[1])}`);
    return;
  }

  if (parts.length === 3) {
    console.log(`trigram score: ${getTrigramScore(parts[0], parts[1], parts[2])}`);
    return;
  }

  console.log("Usage: :ngram word1 word2 [word3]");
}

function printExplain(inputText) {
  const result = searchSentence(inputText, { beamWidth: 5 });
  const tokens = inputText.trim().toLowerCase().split(/\s+/).filter(Boolean);

  console.log(`Normalization: ${inputText.trim().toLowerCase()}`);
  console.log("Candidates:");

  for (const token of tokens) {
    const candidates = getCandidates(token).slice(0, 3);
    console.log(`${token} -> ${candidates.map((candidate) => candidate.text).join(", ")}`);
  }

  for (const token of tokens) {
    for (const typo of getTypoCandidates(token).slice(0, 1)) {
      console.log(`Typo match: ${typo.typo} -> ${typo.canonical}`);
      console.log(`confidence: ${typo.confidence}`);
    }
  }

  console.log(`Beam winner: ${result.best.outputs.join("")}`);
  console.log("Score breakdown:");
  const last = result.best.meta.transitions.at(-1);
  console.log(`- final score: ${Math.round(result.best.score)}`);
  console.log(`- last transition: ${last?.score ?? 0}`);
  console.log(`- last adaptive: ${last?.adaptive ?? 0}`);
}

function printMemory() {
  const memory = loadMemory();
  const entries = Object.entries(memory);

  if (entries.length === 0) {
    console.log("No saved corrections.");
    return;
  }

  for (const [source, entry] of entries) {
    console.log(
      `${source} => ${entry.output}    count: ${entry.count}    updated: ${entry.updatedAt}`
    );
  }
}

function printHelp() {
  console.log(`Usage:
  node src/cli.js "ami bangla likhi"
  node src/cli.js --interactive

Interactive commands:
  :q, :quit                 Exit
  :candidates order         Show candidate list with scores
  :beam pre order korbo     Show beam search paths and scores
  :eval                     Run corpus evaluation
  :benchmark                Run speed benchmark
  :fix input = output       Save a user correction
  :learn input = output     Teach correction, sentence, and typo memory
  :memory-stats             Show learning and cache stats
  :ngram phrase             Show bigram/trigram score
  :explain input            Explain ranking pipeline
  :profile coding           Switch ranking profile
  :profiles                 List profiles
  :lm phrase                Show language-model scores
  :perplexity               Show language-model stats
  :runtime-stats            Show runtime adaptation stats
  :rebuild-status           Show background rebuild state
  :memory                   Show saved corrections
  :clear-memory             Clear saved corrections after confirmation
  :clear-memory --yes       Clear saved corrections without confirmation`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
