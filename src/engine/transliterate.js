import { beamSearch } from "./beam-search.js";
import { buildCandidateGraph } from "./graph-builder.js";
import { getAvroCandidate } from "../adapters/compatibility/avro-rule-loader.js";

export function transliterateSentence(input, options = {}) {
  const exact = getAvroCandidate(input);
  if (exact) return exact.text;

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
