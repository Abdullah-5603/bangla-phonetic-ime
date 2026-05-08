#!/usr/bin/env node

import { loadAvroPdfSpec } from "../src/engine/avro-spec-parser.js";

export function main() {
  const spec = loadAvroPdfSpec();
  console.log(`vowels: ${spec.vowels.length}`);
  console.log(`consonants: ${spec.consonants.length}`);
  console.log(`kars: ${spec.kars.length}`);
  console.log(`special: ${spec.special.length}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
