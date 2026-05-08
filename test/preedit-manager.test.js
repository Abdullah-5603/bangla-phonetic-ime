import test from "node:test";
import assert from "node:assert/strict";
import { createPreeditManager } from "../src/engine/preedit-manager.js";

test("preedit manager selects candidates", () => {
  const manager = createPreeditManager();
  manager.update("ami", [
    { text: "আমি" },
    { text: "আমিই" }
  ]);
  assert.equal(manager.getPreedit(), "আমি");
  assert.equal(manager.select(2), "আমিই");
});

