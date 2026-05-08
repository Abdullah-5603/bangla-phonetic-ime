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
  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    score: results.length === 0 ? 0 : (passed / results.length) * 100,
    results,
    failedCases: results.filter((item) => !item.passed)
  };
}

