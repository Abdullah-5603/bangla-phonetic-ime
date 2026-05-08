export function createCommitState() {
  return {
    committed: []
  };
}

export function commitText(state, text) {
  if (text) state.committed.push(text);
  return text;
}

export function getCommittedText(state) {
  return state.committed.join("");
}

