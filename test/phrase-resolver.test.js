import test from "node:test";
import assert from "node:assert/strict";
import { getPhraseCandidatesAt, resolvePhraseAt } from "../src/engine/phrase-resolver.js";
import { normalizeInput } from "../src/engine/normalizer.js";
import { tokenize } from "../src/engine/tokenizer.js";

test("resolvePhraseAt matches longest phrase overrides", () => {
  const tokens = tokenize(normalizeInput("software developer"));
  const resolved = resolvePhraseAt(tokens, 0);

  assert.equal(resolved.text, "সফটওয়্যার ডেভেলপার");
  assert.equal(resolved.nextIndex, tokens.length);
});

test("getPhraseCandidatesAt resolves pre-order punctuation phrase", () => {
  const tokens = tokenize(normalizeInput("pre-order"));
  const candidates = getPhraseCandidatesAt(tokens, 0);

  assert.equal(candidates[0].text, "প্রি-অর্ডার");
});

