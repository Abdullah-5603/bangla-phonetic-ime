let nextSessionId = 1;

export function createProtocolSession() {
  return {
    id: `session-${nextSessionId++}`,
    active: true,
    createdAt: new Date().toISOString()
  };
}

export function closeProtocolSession(session) {
  session.active = false;
  session.closedAt = new Date().toISOString();
  return session;
}

