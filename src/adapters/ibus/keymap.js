export function mapIbusKey(key) {
  if (key === "space") return { key: " " };
  if (key === "BackSpace") return { key: "Backspace" };
  if (key === "Return") return { key: "Enter" };
  return { key: String(key ?? "") };
}

