export function formatCompatibilityReport(report) {
  const lines = [
    `PDF Spec Cases: ${report.passed}/${report.total} passed`,
    `Case-sensitive Rules: ${report.caseSensitiveRules.passed}/${report.caseSensitiveRules.total} passed`,
    `Accent Rules: ${report.accentRules.passed}/${report.accentRules.total} passed`,
    `Compatibility Score: ${report.score.toFixed(1)}%`,
    "Known Gaps:"
  ];

  if (report.knownGaps.length === 0) {
    lines.push("- none declared");
  } else {
    for (const gap of report.knownGaps) {
      lines.push(`- ${gap}`);
    }
  }

  lines.push(
    "",
    "Failed Cases:"
  );

  if (report.failedCases.length === 0) {
    lines.push("None");
  } else {
    report.failedCases.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.input}`);
      lines.push(`Expected: ${item.expected}`);
      lines.push(`Actual: ${item.actual}`);
      lines.push(`Category: ${item.category}`);
    });
  }

  return lines.join("\n");
}
