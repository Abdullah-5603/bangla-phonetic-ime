import { beamSearch } from "./beam-search.js";
import { buildCandidateGraph } from "./graph-builder.js";
import { transliterateAvroSpec } from "./avro-spec-engine.js";
import { resolveAvroMode } from "./avro-compatibility-mode.js";

export function transliterateSentence(input, options = {}) {
  if (resolveAvroMode(options) === "avro-strict") {
    return transliterateAvroSpec(input, options).text;
  }

  const result = searchSentence(input, options);
  return result.best.outputs.join("");
}

export function searchSentence(input, options = {}) {
  if (resolveAvroMode(options) === "avro-strict") {
    const text = transliterateAvroSpec(input, options).text;
    const path = {
      outputs: [text],
      score: Number.MAX_SAFE_INTEGER,
      meta: { transitions: [{ score: Number.MAX_SAFE_INTEGER, adaptive: 0 }] }
    };

    return {
      graph: {
        input,
        normalized: String(input ?? ""),
        tokens: [],
        edges: new Map()
      },
      paths: [path],
      best: path
    };
  }

  const graph = buildCandidateGraph(input, options);
  return {
    graph,
    ...beamSearch(graph, options)
  };
}
