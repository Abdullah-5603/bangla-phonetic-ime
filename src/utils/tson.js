import fs from "node:fs";
import path from "node:path";

const MEMORY_HEADER = "# bangla-phonetic-ime tson v1";

export function readTSON(filePath, options = {}) {
  try {
    const source = fs.readFileSync(filePath, "utf8");
    return parseTsonRows(source, options.columns);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    if (error instanceof SyntaxError && options.recover !== false) {
      recoverCorruptFile(filePath);
      return [];
    }

    throw error;
  }
}

export function writeTSON(filePath, rows, options = {}) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const compact = compactTSON(rows, options.header);
  const tmpPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmpPath, compact);
  fs.renameSync(tmpPath, filePath);
}

export function validateTSON(source, options = {}) {
  try {
    parseTsonRows(source, options.columns);
    return { valid: true, errors: [] };
  } catch (error) {
    return { valid: false, errors: [error.message] };
  }
}

export function compactTSON(rows, header = MEMORY_HEADER) {
  return stringifyTsonRows(rows, header);
}

export function mergeTSON(...rowSets) {
  const seen = new Map();

  for (const rows of rowSets) {
    for (const row of rows) {
      seen.set(row.join("\u0001"), row);
    }
  }

  return [...seen.values()];
}

export function parseTson(source) {
  const memory = {};

  for (const [input, output, countText, updatedAt] of parseTsonRows(source, 4)) {
    const count = Number(countText);

    if (!input || !output || !Number.isInteger(count) || count < 1 || !updatedAt) {
      throw new SyntaxError("Invalid TSON memory value.");
    }

    memory[input] = { output, count, updatedAt };
  }

  return memory;
}

export function parseTsonRows(source, expectedColumns) {
  const rows = [];
  const text = String(source ?? "").trim();

  if (!text) {
    return rows;
  }

  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) {
      continue;
    }

    const columns = splitEscapedTabs(line).map(unescapeValue);

    if (expectedColumns && columns.length !== expectedColumns) {
      throw new SyntaxError("Invalid TSON row.");
    }

    rows.push(columns);
  }

  return rows;
}

export function stringifyTson(memory) {
  const rows = Object.entries(memory)
    .filter(([, entry]) => entry?.output)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([input, entry]) => [
      input,
      entry.output,
      String(Number(entry.count || 1)),
      entry.updatedAt || new Date(0).toISOString()
    ]);

  return stringifyTsonRows(rows, MEMORY_HEADER);
}

export function stringifyTsonRows(rows, header) {
  const lines = header ? [header] : [];

  for (const row of rows) {
    lines.push(row.map(escapeValue).join("\t"));
  }

  return `${lines.join("\n")}\n`;
}

function recoverCorruptFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const backupPath = `${filePath}.invalid-${Date.now()}.bak`;
  fs.copyFileSync(filePath, backupPath);
  fs.writeFileSync(filePath, `${MEMORY_HEADER}\n`);
}

function splitEscapedTabs(line) {
  const columns = [];
  let current = "";
  let escaped = false;

  for (const char of line) {
    if (escaped) {
      current += `\\${char}`;
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === "\t") {
      columns.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  if (escaped) {
    current += "\\";
  }

  columns.push(current);
  return columns;
}

function escapeValue(value) {
  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("\t", "\\t")
    .replaceAll("\n", "\\n")
    .replaceAll("\r", "\\r");
}

function unescapeValue(value) {
  let output = "";
  let escaped = false;

  for (const char of String(value)) {
    if (!escaped && char === "\\") {
      escaped = true;
      continue;
    }

    if (escaped) {
      if (char === "t") output += "\t";
      else if (char === "n") output += "\n";
      else if (char === "r") output += "\r";
      else output += char;

      escaped = false;
      continue;
    }

    output += char;
  }

  if (escaped) {
    output += "\\";
  }

  return output;
}

