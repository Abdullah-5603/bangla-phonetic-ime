import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeInput } from "./normalizer.js";
import { parseTsonRows, writeTSON } from "../utils/tson.js";
import { enqueueRebuild } from "./runtime-state.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const userLearningPath = path.resolve(__dirname, "../data/corpus/user-learning.tson");

export function appendLearningCase(input, expected, category = "User Learning") {
  const rows = fs.existsSync(userLearningPath)
    ? parseTsonRows(fs.readFileSync(userLearningPath, "utf8"), 3)
    : [];
  rows.push([normalizeInput(input), String(expected ?? "").trim(), category]);
  writeTSON(userLearningPath, rows, { header: "# input\texpected\tcategory" });
  enqueueRebuild("user-learning");
  return rows.length;
}

