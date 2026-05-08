import { loadAvroCompatibilityCorpus } from "./avro-rule-loader.js";
import { transliterateAvroCompatible } from "./avro-compat.js";

export function diffCompatibilityRules() {
  return loadAvroCompatibilityCorpus()
    .map((item) => ({
      ...item,
      actual: transliterateAvroCompatible(item.input)
    }))
    .filter((item) => item.actual !== item.expected);
}

