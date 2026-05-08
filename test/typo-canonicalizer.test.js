import test from "node:test";
import assert from "node:assert/strict";
import { canonicalizeTypo } from "../src/engine/typo-canonicalizer.js";

test("canonicalizes known order typos", () => {
  assert.equal(canonicalizeTypo("orrdar").canonical, "order");
  assert.equal(canonicalizeTypo("odrer").canonical, "order");
});

test("does not destructively canonicalize short tokens", () => {
  assert.equal(canonicalizeTypo("api").canonical, "api");
});

