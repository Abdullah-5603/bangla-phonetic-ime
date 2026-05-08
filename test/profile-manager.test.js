import test from "node:test";
import assert from "node:assert/strict";
import {
  getProfile,
  getProfileBoost,
  listProfiles,
  setProfile
} from "../src/engine/profile-manager.js";

test("profile manager lists and switches profiles", () => {
  assert.ok(listProfiles().includes("coding"));
  setProfile("coding");
  assert.equal(getProfile(), "coding");
  setProfile("default");
});

test("coding profile boosts coding terms", () => {
  assert.ok(getProfileBoost(["এপিআই", "ক্লায়েন্ট"], "coding") > 0);
});

