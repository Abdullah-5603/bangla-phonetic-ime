import { transliterateAvroCompatible } from "./avro-compat.js";
import { loadAvroCompatibilityCorpus } from "./avro-rule-loader.js";

export function validateAvroCompatibility(corpus = loadAvroCompatibilityCorpus()) {
  const results = corpus.map((item) => {
    const actual = transliterateAvroCompatible(item.input);
    return {
      ...item,
      actual,
      passed: actual === item.expected
    };
  });

  const passed = results.filter((item) => item.passed).length;
  const categoryStats = summarizeCategories(results);
  const caseSensitiveRules = metricForCategoryPrefix(results, "case");
  const accentRules = metricForCategoryPrefix(results, "accent");

  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    score: results.length === 0 ? 0 : (passed / results.length) * 100,
    categoryStats,
    caseSensitiveRules,
    accentRules,
    knownGaps: [
      "Full Avro dictionary/autocorrect parity is not implemented in strict mode.",
      "Fola and rare conjunct edge-cases are partially covered.",
      "Desktop IME UI parity (IBus/Fcitx behavior) is out of scope for v0.0.9."
    ],
    results,
    failedCases: results.filter((item) => !item.passed)
  };
}

function summarizeCategories(results) {
  const stats = new Map();

  for (const item of results) {
    const key = item.category;
    const previous = stats.get(key) ?? { total: 0, passed: 0 };
    previous.total += 1;
    if (item.passed) previous.passed += 1;
    stats.set(key, previous);
  }

  return [...stats.entries()].map(([category, value]) => ({
    category,
    total: value.total,
    passed: value.passed
  }));
}

function metricForCategoryPrefix(results, prefix) {
  const relevant = results.filter((item) => item.category.toLowerCase().startsWith(prefix));
  const passed = relevant.filter((item) => item.passed).length;
  return {
    total: relevant.length,
    passed
  };
}
