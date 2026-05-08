import { createLRUCache } from "./cache.js";

export function createSessionCache(prefix = "session") {
  return {
    candidates: createLRUCache(`${prefix}:candidates`, 300),
    suggestions: createLRUCache(`${prefix}:suggestions`, 300),
    preedit: createLRUCache(`${prefix}:preedit`, 300)
  };
}

