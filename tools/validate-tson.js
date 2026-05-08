#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { validateTSON } from "../src/utils/tson.js";

const roots = ["src/data"];

export function validateTsonFiles() {
  const files = roots.flatMap((root) => walk(root)).filter((file) => file.endsWith(".tson"));
  const results = files.map((file) => ({
    file,
    ...validateTSON(fs.readFileSync(file, "utf8"))
  }));

  return results;
}

export function main() {
  const results = validateTsonFiles();
  const failed = results.filter((result) => !result.valid);

  if (failed.length === 0) {
    console.log(`TSON valid: ${results.length} files`);
    return;
  }

  for (const result of failed) {
    console.log(`${result.file}: ${result.errors.join(", ")}`);
  }

  process.exitCode = 1;
}

function walk(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

