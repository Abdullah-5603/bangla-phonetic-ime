const HEADER = "# bangla-phonetic-ime tson v1";

export function parseTson(source) {
  const memory = {};
  const text = String(source ?? "").trim();

  if (!text) {
    return memory;
  }

  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    if (!line || line.startsWith("#")) {
      continue;
    }

    const columns = splitEscapedTabs(line);

    if (columns.length !== 4) {
      throw new SyntaxError("Invalid TSON memory row.");
    }

    const [input, output, countText, updatedAt] = columns.map(unescapeValue);
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
  const lines = [HEADER];

  for (const [input, entry] of Object.entries(memory).sort(([a], [b]) =>
    a.localeCompare(b)
  )) {
    if (!entry?.output) {
      continue;
    }

    lines.push(
      [
        escapeValue(input),
        escapeValue(entry.output),
        escapeValue(String(Number(entry.count || 1))),
        escapeValue(entry.updatedAt || new Date(0).toISOString())
      ].join("\t")
    );
  }

  return `${lines.join("\n")}\n`;
}

export function stringifyTsonRows(rows, header) {
  const lines = header ? [header] : [];

  for (const row of rows) {
    lines.push(row.map(escapeValue).join("\t"));
  }

  return `${lines.join("\n")}\n`;
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
