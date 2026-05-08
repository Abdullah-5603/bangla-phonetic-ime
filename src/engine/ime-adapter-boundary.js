import { getCandidates, learn, transliterate } from "./index.js";

export function createSession(options = {}) {
  return {
    buffer: "",
    committed: [],
    options
  };
}

export function destroySession(session) {
  session.buffer = "";
  session.committed = [];
}

export function processKeystroke(session, key) {
  if (key === "Backspace") {
    session.buffer = session.buffer.slice(0, -1);
  } else if (key === "Enter") {
    commitCandidate(session, transliterate(session.buffer, session.options));
  } else {
    session.buffer += key;
  }

  return getSuggestions(session);
}

export function getSuggestions(session) {
  return getCandidates(session.buffer, session.options);
}

export function commitCandidate(session, candidate) {
  const text = typeof candidate === "string" ? candidate : candidate.text;
  if (text) session.committed.push(text);
  session.buffer = "";
  return text;
}

export function resetSession(session) {
  session.buffer = "";
  return session;
}

export function learnFromCommit(input, output) {
  return learn(input, output, { context: "ime-boundary" });
}

