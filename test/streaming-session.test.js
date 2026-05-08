import test from "node:test";
import assert from "node:assert/strict";
import { createStreamingSession } from "../src/engine/index.js";

test("processText creates Bangla preedit", () => {
  const session = createStreamingSession();
  session.processText("ami");
  assert.equal(session.getPreedit(), "আমি");
});

test("space commits current preedit", () => {
  const session = createStreamingSession();
  session.processText("ami");
  session.processKey({ key: " " });
  assert.equal(session.getCommittedText(), "আমি ");
  assert.equal(session.getPreedit(), "");
});

test("backspace removes roman input and recomputes preedit", () => {
  const session = createStreamingSession();
  session.processText("ami");
  session.backspace();
  assert.equal(session.getState().rawBuffer, "am");
  assert.equal(session.getPreedit(), "আম");
});

test("selectCandidate changes preedit and destroy cleans state", () => {
  const session = createStreamingSession();
  session.processText("am");
  session.selectCandidate(2);
  assert.equal(session.getPreedit(), "এম");
  session.destroy();
  assert.equal(session.getState().destroyed, true);
});

