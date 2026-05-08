export function createPreeditState() {
  return {
    text: "",
    cursor: 0,
    visible: false
  };
}

export function updatePreedit(state, text, cursor = text.length) {
  state.text = text;
  state.cursor = cursor;
  state.visible = Boolean(text);
  return state;
}

export function clearPreedit(state) {
  state.text = "";
  state.cursor = 0;
  state.visible = false;
  return state;
}

