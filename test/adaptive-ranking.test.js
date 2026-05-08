import test from "node:test";
import assert from "node:assert/strict";
import { scoreAdaptiveNode } from "../src/engine/adaptive-ranker.js";
import { buildCandidateGraph } from "../src/engine/graph-builder.js";
import { searchSentence } from "../src/engine/index.js";

test("adaptive scoring boosts frequent known outputs", () => {
  const graph = buildCandidateGraph("order");
  const node = graph.edges.get(0).find((candidate) => candidate.text === "অর্ডার");
  const score = scoreAdaptiveNode({ outputs: [] }, node, graph);

  assert.ok(score > 0);
});

test("adaptive beam keeps the coherent sentence first", () => {
  assert.equal(searchSentence("pre order korbo").best.outputs.join(""), "প্রি অর্ডার করবো");
});

