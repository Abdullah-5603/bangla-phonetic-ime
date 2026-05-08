import test from "node:test";
import assert from "node:assert/strict";
import { createSuggestionEngine } from "../src/engine/suggestion-engine.js";

test("suggestions update for partial input", () => {
  const engine = createSuggestionEngine();
  assert.ok(engine.suggest("a").some((candidate) => candidate.text === "আ"));
  assert.ok(engine.suggest("am").some((candidate) => candidate.text === "আম"));
  assert.equal(engine.suggest("ami")[0].text, "আমি");
});

