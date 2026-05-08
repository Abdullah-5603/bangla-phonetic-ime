export function createPreeditManager() {
  let preedit = "";
  let candidates = [];
  let selectedIndex = 0;

  return {
    update(rawBuffer, nextCandidates) {
      candidates = nextCandidates;
      selectedIndex = Math.min(selectedIndex, Math.max(0, candidates.length - 1));
      preedit = rawBuffer ? candidates[selectedIndex]?.text ?? "" : "";
      return preedit;
    },
    select(index) {
      const normalizedIndex = normalizeIndex(index, candidates.length);
      selectedIndex = normalizedIndex;
      preedit = candidates[selectedIndex]?.text ?? preedit;
      return preedit;
    },
    getPreedit() {
      return preedit;
    },
    getCandidates() {
      return candidates;
    },
    getSelectedIndex() {
      return selectedIndex;
    },
    reset() {
      preedit = "";
      candidates = [];
      selectedIndex = 0;
    }
  };
}

function normalizeIndex(index, length) {
  if (length <= 0) return 0;
  const numeric = Number(index);
  const zeroBased = numeric > 0 ? numeric - 1 : numeric;
  return Math.max(0, Math.min(length - 1, zeroBased));
}

