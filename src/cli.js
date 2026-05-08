#!/usr/bin/env node

import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { transliterate } from "./engine/index.js";

export async function main(argv = process.argv.slice(2)) {
  if (argv.includes("--help") || argv.includes("-h")) {
    printHelp();
    return;
  }

  if (argv.includes("--interactive") || argv.includes("-i")) {
    await runInteractive();
    return;
  }

  const text = argv.join(" ");
  if (!text) {
    printHelp();
    return;
  }

  console.log(transliterate(text));
}

async function runInteractive() {
  const rl = createInterface({ input, output });

  try {
    while (true) {
      const line = await rl.question("> ");
      const command = line.trim();

      if (command === ":q" || command === ":quit") {
        break;
      }

      console.log(transliterate(line));
    }
  } finally {
    rl.close();
  }
}

function printHelp() {
  console.log(`Usage:
  node src/cli.js "ami bangla likhi"
  node src/cli.js --interactive

Interactive commands:
  :q, :quit    Exit`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

