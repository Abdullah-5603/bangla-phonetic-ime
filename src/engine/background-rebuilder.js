import { enqueueRebuild, getRuntimeStats, markRebuildComplete } from "./runtime-state.js";

export function requestBackgroundRebuild(task = "runtime-state") {
  enqueueRebuild(task);
  return getRebuildStatus();
}

export async function runBackgroundRebuild() {
  await Promise.resolve();
  markRebuildComplete();
  return getRebuildStatus();
}

export function getRebuildStatus() {
  const stats = getRuntimeStats();
  return {
    queueLength: stats.rebuildQueue.length,
    queue: stats.rebuildQueue,
    lastRebuildAt: stats.lastRebuildAt
  };
}

