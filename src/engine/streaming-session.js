import { createCommitManager } from "./commit-manager.js";
import { createCompositionBuffer } from "./composition-buffer.js";
import { normalizeKeyEvent } from "./key-event-normalizer.js";
import { createLatencyMonitor } from "./latency-monitor.js";
import { createPreeditManager } from "./preedit-manager.js";
import { createSessionCache } from "./session-cache.js";
import { createSuggestionEngine } from "./suggestion-engine.js";

export function createStreamingSession(options = {}) {
  const cache = createSessionCache(options.cachePrefix ?? "stream");
  const latency = createLatencyMonitor();
  const buffer = createCompositionBuffer();
  const suggestionEngine = createSuggestionEngine({
    ...options,
    cache: cache.candidates
  });
  const preeditManager = createPreeditManager();
  const commitManager = createCommitManager(buffer, preeditManager, latency);
  let destroyed = false;

  function updateComposition() {
    return latency.measure("preedit", () => {
      const raw = buffer.getRawBuffer();
      const suggestions = latency.measure("suggestion", () =>
        latency.measure("candidate", () => suggestionEngine.suggest(raw))
      );
      return preeditManager.update(raw, suggestions);
    });
  }

  const session = {
    processKey(keyEvent) {
      assertActive();
      return latency.measure("processKey", () => {
        const event = normalizeKeyEvent(keyEvent);

        if (event.isBackspace) {
          buffer.backspace();
          updateComposition();
          return session.getState();
        }

        if (event.isSpace) {
          if (buffer.getRawBuffer()) {
            commitManager.commit(" ");
          } else {
            buffer.commit(" ");
          }
          return session.getState();
        }

        if (event.isEnter) {
          commitManager.commit();
          return session.getState();
        }

        if (event.printable) {
          buffer.append(event.key);
          updateComposition();
        }

        return session.getState();
      });
    },
    processText(text) {
      assertActive();
      for (const char of String(text ?? "")) {
        session.processKey(char === " " ? "SPACE" : char);
      }
      return session.getState();
    },
    backspace() {
      return session.processKey({ key: "Backspace" });
    },
    commit() {
      assertActive();
      const committed = commitManager.commit();
      return committed;
    },
    cancel() {
      assertActive();
      buffer.clear();
      preeditManager.reset();
    },
    reset() {
      assertActive();
      buffer.reset();
      preeditManager.reset();
    },
    getPreedit() {
      return preeditManager.getPreedit();
    },
    getCommittedText() {
      return buffer.getCommittedText();
    },
    getSuggestions() {
      return preeditManager.getCandidates();
    },
    selectCandidate(index) {
      assertActive();
      return preeditManager.select(index);
    },
    getState() {
      return {
        ...buffer.getState(),
        preedit: preeditManager.getPreedit(),
        suggestions: preeditManager.getCandidates(),
        selectedIndex: preeditManager.getSelectedIndex(),
        latency: latency.stats(),
        destroyed
      };
    },
    getLatencyStats() {
      return latency.stats();
    },
    destroy() {
      buffer.reset();
      preeditManager.reset();
      destroyed = true;
    }
  };

  return session;

  function assertActive() {
    if (destroyed) {
      throw new Error("Streaming session has been destroyed.");
    }
  }
}

