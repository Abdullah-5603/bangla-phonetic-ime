import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createLRUCache } from "./cache.js";
import { getActiveProfile, setActiveProfile } from "./runtime-state.js";
import { parseTsonRows } from "../utils/tson.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const profileDir = path.resolve(__dirname, "../data/profiles");
const profileCache = createLRUCache("profile", 100);

export function listProfiles() {
  return fs
    .readdirSync(profileDir)
    .filter((file) => file.endsWith(".tson"))
    .map((file) => file.replace(/\.tson$/, ""));
}

export function setProfile(profileName) {
  if (!listProfiles().includes(profileName)) {
    throw new Error(`Unknown profile: ${profileName}`);
  }

  return setActiveProfile(profileName);
}

export function getProfile() {
  return getActiveProfile();
}

export function getProfileBoost(outputs, profileName = getActiveProfile()) {
  const profile = loadProfile(profileName);
  const joined = outputs.join(" ");
  let boost = 0;

  for (const [term, value] of profile.entries()) {
    if (outputs.includes(term) || joined.includes(term)) {
      boost += value;
    }
  }

  return boost;
}

export function getProfileStats() {
  return {
    activeProfile: getActiveProfile(),
    profiles: listProfiles()
  };
}

function loadProfile(profileName) {
  const cached = profileCache.get(profileName);
  if (cached !== undefined) return cached;

  const rows = parseTsonRows(
    fs.readFileSync(path.join(profileDir, `${profileName}.tson`), "utf8"),
    2
  );
  const profile = new Map(rows.map(([term, boost]) => [term, Number(boost)]));
  profileCache.set(profileName, profile);
  return profile;
}

