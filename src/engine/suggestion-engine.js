import { createIncrementalCandidateUpdater } from "./incremental-candidates.js";
import { resolveAvroMode } from "./avro-compatibility-mode.js";

const PARTIAL_SUGGESTIONS = new Map([
  [
    "a",
    [
      { text: "আ", score: 5000, source: "partial" },
      { text: "অ", score: 4500, source: "partial" },
      { text: "অ্যা", score: 2500, source: "partial" }
    ]
  ],
  [
    "am",
    [
      { text: "আম", score: 5000, source: "partial" },
      { text: "এম", score: 2500, source: "partial" }
    ]
  ]
]);

export function createSuggestionEngine(options = {}) {
  const updater = createIncrementalCandidateUpdater(options);
  const mode = resolveAvroMode(options);

  return {
    suggest(buffer) {
      if (!buffer) return [];
      const partial = mode === "avro-smart" ? PARTIAL_SUGGESTIONS.get(buffer.toLowerCase()) ?? [] : [];
      const candidates = updater.update(buffer);
      return uniqueSuggestions([...candidates, ...partial]).slice(0, options.limit ?? 5);
    },
    getLast: updater.getLast
  };
}

function uniqueSuggestions(candidates) {
  const seen = new Map();

  for (const candidate of candidates) {
    const previous = seen.get(candidate.text);
    if (!previous || Number(candidate.score || 0) > Number(previous.score || 0)) {
      seen.set(candidate.text, candidate);
    }
  }

  return [...seen.values()].sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
}
