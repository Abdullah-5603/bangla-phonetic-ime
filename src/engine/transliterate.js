import { beamSearch } from "./beam-search.js";
import { buildCandidateGraph } from "./graph-builder.js";

export function transliterateSentence(input, options = {}) {
  const result = searchSentence(input, options);
  return result.best.outputs.join("");
}

export function searchSentence(input, options = {}) {
  const graph = buildCandidateGraph(input, options);
  return {
    graph,
    ...beamSearch(graph, options)
  };
}

