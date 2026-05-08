import {
  commitCandidate,
  createInputSession,
  getCandidateList,
  getPreeditText,
  processKeyEvent,
  resetComposition
} from "./ime-contract.js";
import { learn } from "./index.js";

export function createSession(options = {}) {
  return createInputSession(options);
}

export function destroySession(session) {
  session.destroy();
}

export function processKeystroke(session, key) {
  processKeyEvent(session, key);
  return getSuggestions(session);
}

export function getSuggestions(session) {
  return getCandidateList(session);
}

export function commitBoundaryCandidate(session, index = 1) {
  return commitCandidate(session, index);
}

export function resetSession(session) {
  resetComposition(session);
  return session;
}

export function getPreedit(session) {
  return getPreeditText(session);
}

export function learnFromCommit(input, output) {
  return learn(input, output, { context: "ime-boundary" });
}
