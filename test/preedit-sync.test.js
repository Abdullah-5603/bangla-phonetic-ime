import test from "node:test";
import assert from "node:assert/strict";
import { createPreeditSync } from "../src/adapters/ibus/preedit-sync.js";

test("preedit sync mirrors preedit protocol state", () => {
  const sync = createPreeditSync();
  sync.sync("আমি", 2);
  assert.equal(sync.state.text, "আমি");
  assert.equal(sync.state.visible, true);
  sync.clear();
  assert.equal(sync.state.visible, false);
});

