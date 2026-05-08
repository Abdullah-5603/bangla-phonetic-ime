import { scoreTransition } from "./transition-scorer.js";

const DEFAULT_BEAM_WIDTH = 5;

export function beamSearch(graph, options = {}) {
  const beamWidth = Math.max(1, Number(options.beamWidth || DEFAULT_BEAM_WIDTH));
  const frontier = new Map();
  frontier.set(0, [createInitialPath()]);

  for (let index = 0; index <= graph.tokens.length; index += 1) {
    const paths = frontier.get(index);

    if (!paths?.length) {
      continue;
    }

    const nodes = graph.edges.get(index) ?? [];

    for (const path of paths) {
      for (const node of nodes) {
        const nextIndex = index + node.tokenLength;

        if (nextIndex > graph.tokens.length) {
          continue;
        }

        const nextPath = extendPath(path, node, graph, options);
        const bucket = frontier.get(nextIndex) ?? [];
        bucket.push(nextPath);
        frontier.set(nextIndex, prunePaths(bucket, beamWidth));
      }
    }
  }

  const finalPaths = prunePaths(frontier.get(graph.tokens.length) ?? [], beamWidth);

  return {
    best: finalPaths[0] ?? createInitialPath(),
    paths: finalPaths
  };
}

function createInitialPath() {
  return {
    tokens: [],
    outputs: [],
    score: 0,
    meta: {
      sources: [],
      transitions: [],
      lastLexical: null
    }
  };
}

function extendPath(path, node, graph, options) {
  const transition =
    node.meta.lexical && path.meta.lastLexical
      ? scoreTransition(path.meta.lastLexical, node, {
          graph,
          path,
          options
        })
      : 0;

  const nextScore = path.score + node.score + transition;
  const nextPath = {
    tokens: [...path.tokens, node.meta.input ?? graph.tokens[node.index]?.value ?? ""],
    outputs: [...path.outputs, node.text],
    score: nextScore,
    meta: {
      sources: [...path.meta.sources, node.source],
      transitions: [
        ...path.meta.transitions,
        {
          from: path.meta.lastLexical?.text ?? null,
          to: node.meta.lexical ? node.text : null,
          score: transition
        }
      ],
      lastLexical: node.meta.lexical ? node : path.meta.lastLexical
    }
  };

  return nextPath;
}

function prunePaths(paths, beamWidth) {
  const seen = new Map();

  for (const path of paths) {
    const text = path.outputs.join("");
    const previous = seen.get(text);

    if (!previous || path.score > previous.score) {
      seen.set(text, path);
    }
  }

  return [...seen.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, beamWidth);
}

