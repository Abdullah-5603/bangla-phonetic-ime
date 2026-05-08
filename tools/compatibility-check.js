#!/usr/bin/env node

import { validateAvroCompatibility } from "../src/adapters/compatibility/avro-validator.js";
import { formatCompatibilityReport } from "../src/adapters/compatibility/compatibility-score.js";

export function main() {
  const report = validateAvroCompatibility();
  console.log(formatCompatibilityReport(report));
  if (report.failed > 0) process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
