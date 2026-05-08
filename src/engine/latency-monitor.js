export function createLatencyMonitor() {
  const timings = {
    processKey: [],
    suggestion: [],
    candidate: [],
    preedit: [],
    commit: []
  };

  return {
    measure(name, fn) {
      const start = performance.now();
      const result = fn();
      record(name, performance.now() - start);
      return result;
    },
    record,
    stats
  };

  function record(name, durationMs) {
    if (!timings[name]) timings[name] = [];
    timings[name].push(durationMs);
    if (timings[name].length > 1000) timings[name].shift();
  }

  function stats() {
    return Object.fromEntries(
      Object.entries(timings).map(([name, values]) => [name, summarize(values)])
    );
  }
}

export function summarize(values) {
  if (!values?.length) {
    return { count: 0, avg: 0, max: 0 };
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return {
    count: values.length,
    avg: total / values.length,
    max: Math.max(...values)
  };
}

