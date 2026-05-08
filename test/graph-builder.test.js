import test from "node:test";
import assert from "node:assert/strict";
import { buildCandidateGraph } from "../src/engine/graph-builder.js";

test("buildCandidateGraph creates phrase and token candidate edges", () => {
  const graph = buildCandidateGraph("pre order korbo");
  const firstEdges = graph.edges.get(0);

  assert.ok(firstEdges.some((node) => node.text === "প্রি অর্ডার"));
  assert.ok(firstEdges.some((node) => node.text === "প্রি"));
  assert.equal(graph.tokens.map((token) => token.value).join(""), "pre order korbo");
});

test("buildCandidateGraph preserves punctuation nodes", () => {
  const graph = buildCandidateGraph("pre order.");
  const lastEdges = graph.edges.get(graph.tokens.length - 1);

  assert.equal(lastEdges[0].text, "।");
});

