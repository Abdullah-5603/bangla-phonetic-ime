import { scoreTransition } from "./transition-scorer.js";

export function scoreContextualCandidate(previous, current, context = {}) {
  return Number(current.score || 0) + scoreTransition(previous, current, context);
}

export function rankContextualCandidates(candidates, previous, context = {}) {
  return [...candidates]
    .map((candidate) => ({
      ...candidate,
      contextualScore: scoreContextualCandidate(previous, candidate, context)
    }))
    .sort((a, b) => b.contextualScore - a.contextualScore);
}

