import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getCandidates, searchSentence, transliterate } from "./index.js";
import { parseTsonRows } from "./tson.js";
import { estimatePerplexity, getLanguageScore } from "./language-model.js";
import { getProfileBoost } from "./profile-manager.js";
import { createStreamingSession } from "./streaming-session.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const corpusDir = path.resolve(__dirname, "../data/corpus");
const DEFAULT_CORPUS_FILES = [
  "common.tson",
  "loanwords.tson",
  "phrases.tson",
  "mixed.tson",
  "edge-cases.tson",
  "user-learning.tson",
  "evaluation-corpus.tson",
  "streaming.tson",
  "regressions.tson"
];

export function loadCorpus(files = DEFAULT_CORPUS_FILES) {
  return files.flatMap((file) => {
    const filePath = path.join(corpusDir, file);

    if (file === "streaming.tson") {
      return parseTsonRows(fs.readFileSync(filePath, "utf8"), 3).map(
        ([inputKeys, expectedPreedits, expectedCommitted]) => ({
          input: inputKeys,
          expected: expectedCommitted,
          category: "Streaming",
          file,
          streaming: true,
          inputKeys: inputKeys.split(",").filter(Boolean),
          expectedPreedits: expectedPreedits ? expectedPreedits.split("|") : [],
          expectedCommitted: expectedCommitted === "-" ? "" : expectedCommitted
        })
      );
    }

    const cases = parseTsonRows(fs.readFileSync(filePath, "utf8"), 3);

    return cases.map(([input, expected, category]) => ({
      input,
      expected,
      category,
      file
    }));
  });
}

export function evaluateCorpus(cases = loadCorpus(), options = {}) {
  const results = cases.map((item) => {
    if (item.streaming) {
      return evaluateStreamingCase(item);
    }

    const search = searchSentence(item.input, options);
    const actual = search.best.outputs.join("");
    const top3 = search.paths.slice(0, 3).map((path) => path.outputs.join(""));
    const candidateTop3 =
      item.input.trim().split(/\s+/).length === 1
        ? getCandidates(item.input).slice(0, 3).map((candidate) => candidate.text)
        : top3;

    return {
      ...item,
      actual,
      top3,
      candidateTop3,
      passed: actual === item.expected,
      top3Passed: top3.includes(item.expected) || candidateTop3.includes(item.expected)
    };
  });

  const total = results.length;
  const passed = results.filter((item) => item.passed).length;
  const top3Passed = results.filter((item) => item.top3Passed).length;
  const streamingResults = results.filter((item) => item.streaming);
  const categories = new Map();

  for (const result of results) {
    const category = categories.get(result.category) ?? { total: 0, passed: 0 };
    category.total += 1;
    if (result.passed) category.passed += 1;
    categories.set(result.category, category);
  }

  return {
    total,
    passed,
    failed: total - passed,
    accuracy: total === 0 ? 0 : (passed / total) * 100,
    top1Accuracy: total === 0 ? 0 : (passed / total) * 100,
    top3Accuracy: total === 0 ? 0 : (top3Passed / total) * 100,
    regressionAccuracy: getCategoryAccuracy(results, "Regressions"),
    typoAccuracy: getCategoryAccuracy(results, "Typo"),
    typoRecoveryAccuracy: getCategoryAccuracy(results, "Typo"),
    phraseAccuracy: getCategoryAccuracy(results, "Phrases"),
    loanwordAccuracy: getCategoryAccuracy(results, "Loanwords"),
    sentenceAccuracy: getCategoryAccuracy(results, "Mixed"),
    sentenceCoherence: getSentenceCoherence(results),
    lmPerplexity: estimatePerplexity(results),
    profileAwareAccuracy: getProfileAwareAccuracy(results),
    preeditAccuracy: getStreamingMetric(streamingResults, "preeditPassed"),
    finalCommitAccuracy: getStreamingMetric(streamingResults, "passed"),
    backspaceBehaviorAccuracy: getStreamingMetric(
      streamingResults.filter((item) => item.inputKeys.includes("BACKSPACE")),
      "preeditPassed"
    ),
    sessionResetAccuracy: getStreamingMetric(
      streamingResults.filter((item) => item.inputKeys.includes("RESET")),
      "resetPassed"
    ),
    categories: [...categories.entries()].map(([category, item]) => ({
      category,
      total: item.total,
      passed: item.passed,
      failed: item.total - item.passed,
      accuracy: item.total === 0 ? 0 : (item.passed / item.total) * 100
    })),
    failedCases: results.filter((item) => !item.passed),
    results
  };
}

export function formatEvaluationReport(report) {
  const lines = [
    `Total Accuracy: ${formatPercent(report.accuracy)}`,
    `Top-1 Accuracy: ${formatPercent(report.top1Accuracy)}`,
    `Top-3 Accuracy: ${formatPercent(report.top3Accuracy)}`,
    `Regression Accuracy: ${formatPercent(report.regressionAccuracy)}`,
    `Typo Recovery Accuracy: ${formatPercent(report.typoRecoveryAccuracy)}`,
    `Phrase Accuracy: ${formatPercent(report.phraseAccuracy)}`,
    `Loanword Accuracy: ${formatPercent(report.loanwordAccuracy)}`,
    `Sentence Accuracy: ${formatPercent(report.sentenceAccuracy)}`,
    `Sentence Coherence: ${formatPercent(report.sentenceCoherence)}`,
    `LM Perplexity: ${report.lmPerplexity.toFixed(2)}`,
    `Profile-aware Accuracy: ${formatPercent(report.profileAwareAccuracy)}`,
    `Preedit Accuracy: ${formatPercent(report.preeditAccuracy)}`,
    `Final Commit Accuracy: ${formatPercent(report.finalCommitAccuracy)}`,
    `Backspace Behavior Accuracy: ${formatPercent(report.backspaceBehaviorAccuracy)}`,
    `Session Reset Accuracy: ${formatPercent(report.sessionResetAccuracy)}`,
    "",
    "Category Accuracy:"
  ];

  for (const category of report.categories) {
    lines.push(
      `- ${category.category}: ${formatPercent(category.accuracy)} (${category.passed}/${category.total})`
    );
  }

  lines.push("", "Failed Cases:");

  if (report.failedCases.length === 0) {
    lines.push("None");
  } else {
    report.failedCases.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.input}`);
      lines.push(`Expected: ${item.expected}`);
      lines.push(`Actual: ${item.actual}`);
    });
  }

  return lines.join("\n");
}

function evaluateStreamingCase(item) {
  const session = createStreamingSession();
  const actualPreedits = [];

  for (const key of item.inputKeys) {
    if (key === "SPACE") {
      session.processKey("SPACE");
      continue;
    }

    if (key === "BACKSPACE") {
      session.backspace();
      actualPreedits.push(session.getPreedit());
      continue;
    }

    if (key === "RESET") {
      session.reset();
      continue;
    }

    session.processKey(key);
    actualPreedits.push(session.getPreedit());
  }

  const actual = session.getCommittedText();
  const preeditPassed = arraysEqual(actualPreedits, item.expectedPreedits);
  const resetPassed = item.inputKeys.includes("RESET")
    ? session.getPreedit() === "" && session.getCommittedText() === ""
    : true;

  return {
    ...item,
    actual,
    actualPreedits,
    top3: [actual],
    candidateTop3: [actual],
    passed: actual === item.expectedCommitted,
    top3Passed: actual === item.expectedCommitted,
    preeditPassed,
    resetPassed
  };
}

function getSentenceCoherence(results) {
  if (results.length === 0) return 0;
  const coherent = results.filter((item) => getLanguageScore(item.actual.split(/\s+/)) > 0);
  return (coherent.length / results.length) * 100;
}

function getProfileAwareAccuracy(results) {
  if (results.length === 0) return 0;
  const profilePositive = results.filter(
    (item) => item.passed || getProfileBoost(item.actual.split(/\s+/), "default") >= 0
  );
  return (profilePositive.length / results.length) * 100;
}

export function runEvaluation(options = {}) {
  return evaluateCorpus(loadCorpus(), options);
}

function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}

function getCategoryAccuracy(results, category) {
  const filtered = results.filter((item) => item.category === category);

  if (filtered.length === 0) {
    return 0;
  }

  return (filtered.filter((item) => item.passed).length / filtered.length) * 100;
}

function getStreamingMetric(results, key) {
  if (results.length === 0) return 0;
  return (results.filter((item) => item[key]).length / results.length) * 100;
}

function arraysEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
