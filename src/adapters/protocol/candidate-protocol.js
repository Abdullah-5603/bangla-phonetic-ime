export function createCandidateState(pageSize = 5) {
  return {
    candidates: [],
    selectedIndex: 0,
    page: 0,
    pageSize
  };
}

export function updateCandidates(state, candidates) {
  state.candidates = candidates.map((candidate, index) => ({
    index,
    text: candidate.text,
    score: candidate.score ?? 0,
    source: candidate.source ?? "unknown"
  }));
  state.selectedIndex = Math.min(state.selectedIndex, Math.max(0, state.candidates.length - 1));
  return state;
}

export function selectCandidate(state, index) {
  state.selectedIndex = Math.max(0, Math.min(state.candidates.length - 1, Number(index)));
  return state.candidates[state.selectedIndex] ?? null;
}

export function getVisibleCandidates(state) {
  const start = state.page * state.pageSize;
  return state.candidates.slice(start, start + state.pageSize);
}

