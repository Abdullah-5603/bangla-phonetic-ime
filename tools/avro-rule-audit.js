#!/usr/bin/env node

import { explainAvroRules, transliterateAvroSpec } from "../src/engine/avro-spec-engine.js";

export function main(argv = process.argv.slice(2)) {
  const input = argv.join(" ");
  if (!input) {
    console.log("Usage: node tools/avro-rule-audit.js input");
    return;
  }

  const output = transliterateAvroSpec(input, { mode: "avro-strict" }).text;
  console.log(`Input: ${input}`);
  console.log(`Output: ${output}`);
  for (const hit of explainAvroRules(input)) {
    console.log(`Matched: ${hit.key} -> ${hit.value || "(empty)"}`);
    console.log(`Source: ${hit.source}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
