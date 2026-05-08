import { createStreamingSession } from "../../engine/index.js";

const sessions = new Map();

export function createIbusSession(id = `ibus-${sessions.size + 1}`, options = {}) {
  const session = createStreamingSession(options);
  sessions.set(id, session);
  return { id, session };
}

export function getIbusSession(id) {
  return sessions.get(id) ?? null;
}

export function destroyIbusSession(id) {
  const session = sessions.get(id);
  if (session) session.destroy();
  sessions.delete(id);
}

export function getSessionCount() {
  return sessions.size;
}

export function resetAllSessions() {
  for (const id of sessions.keys()) destroyIbusSession(id);
}

