export function normalizeKeyEvent(keyEvent) {
  if (typeof keyEvent === "string") {
    return normalizeKeyString(keyEvent);
  }

  const key = keyEvent?.key ?? "";

  return {
    key,
    code: keyEvent?.code ?? "",
    ctrlKey: Boolean(keyEvent?.ctrlKey),
    altKey: Boolean(keyEvent?.altKey),
    shiftKey: Boolean(keyEvent?.shiftKey),
    metaKey: Boolean(keyEvent?.metaKey),
    printable: key.length === 1 && !keyEvent?.ctrlKey && !keyEvent?.altKey && !keyEvent?.metaKey,
    isSpace: key === " " || key === "Space" || key === "SPACE",
    isBackspace: key === "Backspace",
    isEnter: key === "Enter"
  };
}

function normalizeKeyString(key) {
  const value = key === "SPACE" ? " " : key;
  return {
    key: value,
    code: key.length === 1 ? `Key${key.toUpperCase()}` : key,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    printable: value.length === 1 && value !== " ",
    isSpace: value === " ",
    isBackspace: key === "Backspace",
    isEnter: key === "Enter"
  };
}

