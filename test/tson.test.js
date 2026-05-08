import test from "node:test";
import assert from "node:assert/strict";
import { parseTson, stringifyTson } from "../src/engine/tson.js";

test("TSON round-trips user memory records", () => {
  const memory = {
    "pre order": {
      output: "প্রি অর্ডার",
      count: 2,
      updatedAt: "2026-05-08T00:00:00.000Z"
    }
  };

  assert.deepEqual(parseTson(stringifyTson(memory)), memory);
});

test("TSON escapes tabs and newlines", () => {
  const memory = {
    "a\tb": {
      output: "লাইন\nদুই",
      count: 1,
      updatedAt: "2026-05-08T00:00:00.000Z"
    }
  };

  assert.deepEqual(parseTson(stringifyTson(memory)), memory);
});
