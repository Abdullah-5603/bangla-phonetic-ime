import {
  createCandidateState,
  getVisibleCandidates,
  selectCandidate,
  updateCandidates
} from "../protocol/candidate-protocol.js";

export function createCandidateWindow(pageSize = 5) {
  const state = createCandidateState(pageSize);
  return {
    state,
    update(candidates) {
      return updateCandidates(state, candidates);
    },
    select(index) {
      return selectCandidate(state, index);
    },
    visible() {
      return getVisibleCandidates(state);
    }
  };
}

