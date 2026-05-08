export const AVRO_MODES = new Set(["avro-strict", "avro-smart"]);

export function resolveAvroMode(options = {}) {
  const mode = options.mode ?? options.avroMode ?? "avro-smart";
  return AVRO_MODES.has(mode) ? mode : "avro-smart";
}

export function isAvroStrict(options = {}) {
  return resolveAvroMode(options) === "avro-strict";
}
