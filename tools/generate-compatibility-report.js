#!/usr/bin/env node

import { validateAvroCompatibility } from "../src/adapters/compatibility/avro-validator.js";
import { formatCompatibilityReport } from "../src/adapters/compatibility/compatibility-score.js";

export function generateCompatibilityReport() {
  return formatCompatibilityReport(validateAvroCompatibility());
}

export function main() {
  console.log(generateCompatibilityReport());
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
