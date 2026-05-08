#!/usr/bin/env node

import { transliterate } from "../src/engine/index.js";
import { transliterateAvroSpec } from "../src/engine/avro-spec-engine.js";

export function main(argv = process.argv.slice(2)) {
  const input = argv.join(" ");
  if (!input) {
    console.log("Usage: node tools/compare-avro-spec-output.js input");
    return;
  }

  const strictOutput = transliterateAvroSpec(input, { mode: "avro-strict" }).text;
  const smartOutput = transliterate(input, { mode: "avro-smart" });
  console.log(`Input: ${input}`);
  console.log(`Exact Avro: ${strictOutput}`);
  console.log(`Smart Output: ${smartOutput}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
