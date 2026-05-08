import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getCandidates, searchSentence, transliterate } from "./index.js";
import { parseTsonRows } from "./tson.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const corpusDir = path.resolve(__dirname, "../data/corpus");
const DEFAULT_CORPUS_FILES = [
  "common.tson",
  "loanwords.tson",
  "phrases.tson",
  "mixed.tson",
  "edge-cases.tson",
  "user-corrections.tson",
  "regressions.tson"
];

export function loadCorpus(files = DEFAULT_CORPUS_FILES) {
  return files.flatMap((file) => {
    const filePath = path.join(corpusDir, file);
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
    phraseAccuracy: getCategoryAccuracy(results, "Phrases"),
    loanwordAccuracy: getCategoryAccuracy(results, "Loanwords"),
    sentenceAccuracy: getCategoryAccuracy(results, "Mixed"),
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
    `Typo Accuracy: ${formatPercent(report.typoAccuracy)}`,
    `Phrase Accuracy: ${formatPercent(report.phraseAccuracy)}`,
    `Loanword Accuracy: ${formatPercent(report.loanwordAccuracy)}`,
    `Sentence Accuracy: ${formatPercent(report.sentenceAccuracy)}`,
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
