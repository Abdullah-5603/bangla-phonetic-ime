#!/usr/bin/env node

import { runBackgroundRebuild } from "../src/engine/background-rebuilder.js";

export async function main() {
  const status = await runBackgroundRebuild();
  console.log(`queue length: ${status.queueLength}`);
  console.log(`last rebuild: ${status.lastRebuildAt}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

