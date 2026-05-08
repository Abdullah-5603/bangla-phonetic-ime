#!/usr/bin/env node

import { getIbusStatus } from "../src/adapters/ibus/bridge.js";

export function main() {
  const status = getIbusStatus();
  console.log(`bridge state: ${status.bridge}`);
  console.log(`adapter state: ${status.adapter}`);
  console.log(`desktop: ${status.desktop}`);
  console.log(`session count: ${status.sessionCount}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
