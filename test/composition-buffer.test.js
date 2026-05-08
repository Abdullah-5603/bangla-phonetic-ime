import test from "node:test";
import assert from "node:assert/strict";
import { createCompositionBuffer } from "../src/engine/composition-buffer.js";

test("composition buffer appends, backspaces, commits, and resets", () => {
  const buffer = createCompositionBuffer();
  buffer.append("ami");
  assert.equal(buffer.getRawBuffer(), "ami");
  buffer.backspace();
  assert.equal(buffer.getRawBuffer(), "am");
  buffer.commit("আম ");
  assert.equal(buffer.getCommittedText(), "আম ");
  assert.equal(buffer.getRawBuffer(), "");
  buffer.reset();
  assert.equal(buffer.getCommittedText(), "");
});

