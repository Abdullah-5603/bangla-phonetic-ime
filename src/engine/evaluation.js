import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transliterate } from "./index.js";
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
    const actual = transliterate(item.input, options);

    return {
      ...item,
      actual,
      passed: actual === item.expected
    };
  });

  const total = results.length;
  const passed = results.filter((item) => item.passed).length;
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
