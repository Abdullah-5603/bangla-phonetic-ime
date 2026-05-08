export function createCompositionBuffer() {
  let rawBuffer = "";
  let committedText = "";
  let cursor = 0;

  return {
    append(text) {
      rawBuffer = `${rawBuffer.slice(0, cursor)}${text}${rawBuffer.slice(cursor)}`;
      cursor += text.length;
    },
    backspace() {
      if (cursor <= 0) return;
      rawBuffer = `${rawBuffer.slice(0, cursor - 1)}${rawBuffer.slice(cursor)}`;
      cursor -= 1;
    },
    clear() {
      rawBuffer = "";
      cursor = 0;
    },
    reset() {
      rawBuffer = "";
      committedText = "";
      cursor = 0;
    },
    commit(text) {
      committedText += text;
      rawBuffer = "";
      cursor = 0;
    },
    getRawBuffer() {
      return rawBuffer;
    },
    getCommittedText() {
      return committedText;
    },
    getCursor() {
      return cursor;
    },
    getState() {
      return { rawBuffer, committedText, cursor };
    }
  };
}

