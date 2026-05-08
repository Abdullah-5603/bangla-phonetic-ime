import { getLanguageScore } from "./language-model.js";
import { getProfileBoost } from "./profile-manager.js";
import { validateBanglaWord } from "./validator.js";

export function scoreProbabilisticPath(path, graph, options = {}) {
  const outputs = path.outputs.filter((value) => /[\u0980-\u09FF]/.test(value));
  const languageScore = getLanguageScore(outputs) * 1000;
  const profileBoost = getProfileBoost(outputs, options.profile);
  const validationPenalty = outputs.reduce(
    (total, output) => total + validateBanglaWord(output).penalty,
    0
  );

  return {
    languageScore,
    profileBoost,
    validationPenalty,
    total: languageScore + profileBoost - validationPenalty
  };
}

