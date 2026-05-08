import {
  clearPreedit,
  createPreeditState,
  updatePreedit
} from "../protocol/preedit-protocol.js";

export function createPreeditSync() {
  const state = createPreeditState();
  return {
    state,
    sync(text, cursor = text.length) {
      return updatePreedit(state, text, cursor);
    },
    clear() {
      return clearPreedit(state);
    }
  };
}

