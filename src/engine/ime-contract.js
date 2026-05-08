import { createStreamingSession } from "./streaming-session.js";

export function createInputSession(options = {}) {
  return createStreamingSession(options);
}

export function processKeyEvent(session, keyEvent) {
  return session.processKey(keyEvent);
}

export function getPreeditText(session) {
  return session.getPreedit();
}

export function getCandidateList(session) {
  return session.getSuggestions();
}

export function commitCandidate(session, index = 1) {
  session.selectCandidate(index);
  return session.commit();
}

export function resetComposition(session) {
  return session.reset();
}

