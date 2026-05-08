#!/usr/bin/env node

import { writeTSON } from "../src/utils/tson.js";

export function buildProfile(outputPath, pairs) {
  writeTSON(outputPath, pairs, { header: "# term\tboost" });
  return pairs.length;
}

export function main(argv = process.argv.slice(2)) {
  const [outputPath, ...pairs] = argv;
  if (!outputPath || pairs.length === 0 || pairs.length % 2 !== 0) {
    console.log("Usage: node tools/profile-builder.js profile.tson term boost [term boost]");
    return;
  }
  const rows = [];
  for (let index = 0; index < pairs.length; index += 2) {
    rows.push([pairs[index], pairs[index + 1]]);
  }
  console.log(`Rows: ${buildProfile(outputPath, rows)}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

