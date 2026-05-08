import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseTsonRows } from "../../utils/tson.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, "../../data/linux/ibus-config.tson");

export function loadIbusConfig() {
  return Object.fromEntries(parseTsonRows(fs.readFileSync(configPath, "utf8"), 2));
}

export function detectDesktopEnvironment(env = process.env) {
  if (env.WAYLAND_DISPLAY) return "wayland";
  if (env.DISPLAY) return "x11";
  return "unknown";
}

export function getIbusStatus(env = process.env) {
  return {
    bridge: "prototype",
    adapter: "ibus-prototype",
    desktop: detectDesktopEnvironment(env),
    sessionCount: 0
  };
}

