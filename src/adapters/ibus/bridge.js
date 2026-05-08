import { getCandidates } from "../../engine/index.js";
import { getIbusStatus as getBaseStatus } from "./config.js";
import {
  createIbusSession,
  destroyIbusSession,
  getIbusSession,
  getSessionCount
} from "./session-manager.js";

export function startBridge() {
  return {
    state: "running",
    startedAt: new Date().toISOString()
  };
}

export function stopBridge() {
  return {
    state: "stopped",
    stoppedAt: new Date().toISOString()
  };
}

export function createBridgeSession(id) {
  return createIbusSession(id);
}

export function processBridgeKey(id, keyEvent) {
  const session = getIbusSession(id) ?? createIbusSession(id).session;
  return session.processKey(keyEvent);
}

export function getBridgeSuggestions(id) {
  const session = getIbusSession(id);
  return session ? session.getSuggestions() : getCandidates("");
}

export function commitBridgeCandidate(id, index = 1) {
  const session = getIbusSession(id);
  if (!session) return "";
  session.selectCandidate(index);
  return session.commit();
}

export function destroyBridgeSession(id) {
  destroyIbusSession(id);
}

export function getIbusStatus() {
  return {
    ...getBaseStatus(),
    sessionCount: getSessionCount()
  };
}

