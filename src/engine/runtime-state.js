import { createLRUCache, getCacheStats } from "./cache.js";

const runtimeCache = createLRUCache("runtime-state", 200);
const state = {
  activeProfile: "default",
  adaptationEvents: 0,
  profileUsage: new Map([["default", 1]]),
  rebuildQueue: [],
  lastRebuildAt: null
};

export function getActiveProfile() {
  return state.activeProfile;
}

export function setActiveProfile(profileName) {
  state.activeProfile = profileName;
  state.profileUsage.set(profileName, Number(state.profileUsage.get(profileName) || 0) + 1);
  runtimeCache.set("activeProfile", profileName);
  return profileName;
}

export function recordAdaptation(event = "learning") {
  state.adaptationEvents += 1;
  runtimeCache.set(`adaptation:${state.adaptationEvents}`, event);
}

export function enqueueRebuild(task) {
  state.rebuildQueue.push({
    task,
    status: "queued",
    queuedAt: new Date().toISOString()
  });
}

export function markRebuildComplete() {
  state.lastRebuildAt = new Date().toISOString();
  state.rebuildQueue = state.rebuildQueue.map((item) => ({
    ...item,
    status: "completed"
  }));
}

export function getRuntimeStats() {
  return {
    activeProfile: state.activeProfile,
    adaptationEvents: state.adaptationEvents,
    profileUsage: [...state.profileUsage.entries()].map(([profile, count]) => ({
      profile,
      count
    })),
    rebuildQueue: state.rebuildQueue,
    lastRebuildAt: state.lastRebuildAt,
    cacheStats: getCacheStats()
  };
}

