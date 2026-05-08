import test from "node:test";
import assert from "node:assert/strict";
import {
  closeProtocolSession,
  createProtocolSession
} from "../src/adapters/protocol/session-protocol.js";
import {
  createIbusSession,
  destroyIbusSession,
  getIbusSession
} from "../src/adapters/ibus/session-manager.js";

test("protocol sessions and IBus sessions can sync lifecycle", () => {
  const protocol = createProtocolSession();
  const ibus = createIbusSession(protocol.id);
  assert.equal(getIbusSession(protocol.id), ibus.session);
  closeProtocolSession(protocol);
  destroyIbusSession(protocol.id);
  assert.equal(protocol.active, false);
  assert.equal(getIbusSession(protocol.id), null);
});

