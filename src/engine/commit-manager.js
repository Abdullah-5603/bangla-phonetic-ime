export function createCommitManager(buffer, preeditManager, latencyMonitor) {
  return {
    commit(suffix = "") {
      return latencyMonitor.measure("commit", () => {
        const text = `${preeditManager.getPreedit()}${suffix}`;
        if (text) buffer.commit(text);
        preeditManager.reset();
        return text;
      });
    }
  };
}

