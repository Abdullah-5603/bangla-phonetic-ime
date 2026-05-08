export function validateBanglaWord(word) {
  const output = String(word ?? "");
  const issues = [];

  if (/্{2,}/.test(output)) {
    issues.push({ code: "repeated-virama", penalty: 1200 });
  }

  if (/[ািীুূেৈোৌ]{2,}/.test(output)) {
    issues.push({ code: "invalid-kar-sequence", penalty: 900 });
  }

  if (/([\u0995-\u09B9])\1{2,}/.test(output)) {
    issues.push({ code: "suspicious-repetition", penalty: 700 });
  }

  if (/[ািীুূেৈোৌ]্/.test(output)) {
    issues.push({ code: "malformed-vowel-sign", penalty: 900 });
  }

  if (/্[ািীুূেৈোৌ]/.test(output)) {
    issues.push({ code: "impossible-conjunct", penalty: 900 });
  }

  return {
    valid: issues.length === 0,
    issues,
    penalty: issues.reduce((total, issue) => total + issue.penalty, 0)
  };
}

