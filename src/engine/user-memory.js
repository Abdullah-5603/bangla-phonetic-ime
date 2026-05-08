import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeInput } from "./normalizer.js";
import { parseTson, stringifyTson } from "./tson.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const memoryPath = path.resolve(
  __dirname,
  "../data/user/user-memory.tson"
);

export function getUserMemoryPath() {
  return memoryPath;
}

export function loadMemory() {
  ensureMemoryFile();

  try {
    const raw = fs.readFileSync(memoryPath, "utf8");
    return parseTson(raw);
  } catch (error) {
    if (error instanceof SyntaxError) {
      backupInvalidMemory();
      writeMemory({});
      return {};
    }

    if (error.code === "ENOENT") {
      writeMemory({});
      return {};
    }

    throw error;
  }
}

export function getMemoryCorrection(input) {
  const key = normalizeInput(input);
  const memory = loadMemory();
  const entry = memory[key];

  if (!entry?.output) {
    return null;
  }

  return {
    text: entry.output,
    score: 20000 + Number(entry.count || 0),
    source: "user-correction",
    meta: {
      input: key,
      count: entry.count || 0,
      updatedAt: entry.updatedAt
    }
  };
}

export function learnCorrection(input, output) {
  const key = normalizeInput(input);
  const value = String(output ?? "").trim();

  if (!key) {
    throw new Error("Cannot save correction for an empty input.");
  }

  if (!value) {
    throw new Error("Cannot save an empty correction output.");
  }

  const memory = loadMemory();
  const previous = memory[key];

  memory[key] = {
    output: value,
    count: previous?.output === value ? Number(previous.count || 0) + 1 : 1,
    updatedAt: new Date().toISOString()
  };

  writeMemory(memory);
  return memory[key];
}

export function clearMemory() {
  writeMemory({});
}

function ensureMemoryFile() {
  fs.mkdirSync(path.dirname(memoryPath), { recursive: true });

  if (!fs.existsSync(memoryPath)) {
    writeMemory({});
  }
}

function writeMemory(memory) {
  fs.mkdirSync(path.dirname(memoryPath), { recursive: true });
  fs.writeFileSync(memoryPath, stringifyTson(memory));
}

function backupInvalidMemory() {
  if (!fs.existsSync(memoryPath)) {
    return;
  }

  const backupPath = `${memoryPath}.invalid-${Date.now()}.bak`;
  fs.copyFileSync(memoryPath, backupPath);
}
