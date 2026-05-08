export function formatCompatibilityReport(report) {
  const lines = [
    `Compatibility Score: ${report.score.toFixed(1)}%`,
    `Passed: ${report.passed}/${report.total}`,
    "",
    "Failed Cases:"
  ];

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

