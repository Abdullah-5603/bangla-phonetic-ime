# Changelog

All notable changes to this project will be documented in this file.

## v0.0.8 - 2026-05-08

Avro compatibility and Linux IBus prototype groundwork release.

### Added

- Avro compatibility TSON seed data for phonetic rules, exceptions, autocorrect, vowels, conjuncts, known behavior, and compatibility corpus.
- Compatibility modules for Avro rule loading, exact candidate lookup, corpus validation, compatibility scoring, and rule drift checks.
- Adapter-neutral candidate, preedit, commit, and session protocol modules.
- Prototype IBus adapter boundary with bridge, session manager, candidate window state, preedit sync, keymap, config, and installer placeholder.
- Linux desktop status detection for Wayland/X11 and IBus availability.
- Arch/Omarchy packaging groundwork with PKGBUILD and installer/uninstaller scripts.
- CLI commands:
  - `:compat`
  - `:compat-report`
  - `:ibus-status`
  - `:desktop`
- Compatibility tooling:
  - `compatibility-check.js`
  - `compare-with-avro.js`
  - `replay-avro-corpus.js`
  - `validate-ibus.js`
  - `generate-compatibility-report.js`
- `COMPATIBILITY.md` documenting compatibility goals, known differences, and test status.

### Changed

- Updated package version to `0.0.8`.
- Avro exact compatibility candidates now take precedence over user corrections, contextual ranking, and fuzzy fallback.
- Full-input transliteration returns exact Avro compatibility matches before sentence beam search.
- README now documents the Avro compatibility goal, IBus prototype status, packaging status, and Wayland/X11 notes.

### Known Limitations

- Full upstream Avro rule coverage is not complete yet.
- Compatibility score is measured against the curated seed corpus, not the full official Avro behavior surface.
- The IBus adapter is prototype groundwork only.
- Packaging scripts are not yet validated as production Arch/AUR packages.

## v0.0.7 - 2026-05-08

Streaming composition and IME-readiness release.

### Added

- Streaming session API via `createStreamingSession()`.
- Composition buffer for roman input, committed text, and simple cursor state.
- Suggestion engine for partial input.
- Incremental candidate updater with session-local cache support.
- Preedit manager and commit manager.
- Key event normalizer for adapter-neutral key event objects.
- Latency monitor for processKey, suggestion, candidate, preedit, and commit timing.
- IME contract module with adapter-neutral session APIs.
- CLI `--stream` simulation mode.
- Interactive `:stream` mode with `:candidates`, `:select`, and `:latency`.
- Streaming evaluation corpus and streaming accuracy metrics.
- Benchmark metrics for per-key latency and session memory behavior.

### Changed

- Updated package version to `0.0.7`.
- Expanded language-model, bigram, trigram, and quadgram TSON seed data.
- Public API now exports `createStreamingSession()` and `createInputSession()`.

### Known Limitations

- This is still a terminal simulation, not a system IME.
- Cursor movement is intentionally minimal.
- Candidate window mapping is deferred to a future adapter release.

## v0.0.6 - 2026-05-08

Probabilistic language-aware ranking and IME boundary release.

### Added

- Lightweight statistical language model with unigram, bigram, trigram, and quadgram scoring.
- Probabilistic path ranker for sentence-level language probability and profile boosts.
- Profile manager with default, coding, commerce, and personal TSON profiles.
- Smarter typo canonicalizer with learned confidence and bounded edit-distance fallback.
- Runtime state module for profile usage, adaptation events, cache stats, and rebuild queue status.
- Background rebuild boundary.
- Incremental trainer for appending user learning cases.
- IME adapter boundary with session APIs only.
- CLI commands:
  - `:profile`
  - `:profiles`
  - `:lm`
  - `:perplexity`
  - `:runtime-stats`
  - `:rebuild-status`
- Tools:
  - `build-language-model.js`
  - `incremental-train.js`
  - `rebuild-runtime-state.js`
  - `compact-tson.js`
  - `profile-builder.js`
  - `memory-report.js`

### Changed

- Updated package version to `0.0.6`.
- Beam final scoring now includes probabilistic language-model score and profile score.
- Evaluation reports LM perplexity, sentence coherence, typo recovery, and profile-aware accuracy.
- Benchmark reports probabilistic ranking, language-model lookup, profile scoring, rebuild, and runtime adaptation costs.

### Known Limitations

- Language-model data remains small.
- Runtime rebuild is queue/state based, not a long-lived background worker.
- IME adapter boundary is architecture only, not a system input method.

## v0.0.5 - 2026-05-08

Adaptive learning and TSON infrastructure release.

### Added

- Adaptive ranker combining static score, frequency score, ngram score, sentence memory, typo confidence, and validation penalties.
- Sentence memory store at `src/data/user/sentence-memory.tson`.
- Correction memory store at `src/data/user/correction-memory.tson`.
- Learned typo pattern store at `src/data/user/learned-patterns.tson`.
- Ranking memory placeholder at `src/data/user/ranking-memory.tson`.
- Frequency, trigram, typo-pattern, and grammar-pattern dictionaries.
- Online learning API and `:learn` CLI command.
- CLI commands:
  - `:memory-stats`
  - `:ngram`
  - `:explain`
- LRU cache layer with cache statistics.
- Advanced evaluator facade.
- TSON utility layer with read, write, validate, compact, and merge helpers.
- Corpus tools for import, clean, dedupe, frequency building, ngram building, memory export, validation, and rebuild.

### Changed

- Updated package version to `0.0.5`.
- Beam scoring now includes adaptive node scoring and final sentence probability.
- Benchmark output now includes cache stats, typo-learning overhead, and ngram lookup cost.
- Evaluation now includes top-1, top-3, regression, typo, phrase, loanword, and sentence accuracy.
- Project-owned dictionaries, corpora, memory stores, frequency tables, phrase data, and evaluation data remain TSON-only.

### Known Limitations

- Learning is still deterministic and conservative.
- Corpus size remains small.
- Sentence memory currently favors exact normalized input patterns.

## v0.0.4 - 2026-05-08

Sentence-level intelligence and evaluation release.

### Added

- Candidate graph generation for full sentence search.
- Beam search with configurable beam width.
- Contextual transition scoring with bigram, phrase, loanword, grammar, and user-memory signals.
- TSON-backed dictionaries for core words, loanwords, phrases, corrections, and bigrams.
- Bounded Damerau-Levenshtein fuzzy matching for high-confidence loanword entries.
- Bangla word validation penalties for suspicious output patterns.
- Evaluation engine with category accuracy and failed-case reporting.
- Benchmark script for throughput, latency, memory, and beam-search cost.
- Regression corpus and regression-check script.
- CLI commands:
  - `:beam input`
  - `:eval`
  - `:benchmark`

### Changed

- Updated package version to `0.0.4`.
- Moved sentence transliteration into `src/engine/transliterate.js`.
- Replaced token-level best-candidate output with sentence-level beam search.
- Replaced JS dictionary modules with TSON dictionary files.
- Renamed user memory storage to `src/data/user/user-memory.tson`.
- Converted evaluation corpus files and corpus tooling to TSON.

### Known Limitations

- Corpus and contextual grammar rules are still small.
- Ranking remains deterministic heuristics; no neural model or external API.
- Still CLI-only.

## v0.0.3 - 2026-05-08

Storage-only release.

### Changed

- Updated package version to `0.0.3`.
- Replaced user correction memory storage with compact TSON.
- Renamed user memory file to `src/data/user/user-dictionary.tson`.
- Removed runtime object parsing/stringifying from the user memory layer.

## v0.0.2 - 2026-05-08

Refactored the MVP into a candidate-based terminal Bangla phonetic engine.

### Added

- Candidate generation pipeline with ranked candidate objects.
- Phrase resolver with longest-match-first phrase overrides.
- Core Bangla dictionary, loanword dictionary, phrase dictionary, and common corrections.
- User correction memory storage.
- Public `learnCorrection(input, output)` API.
- Interactive CLI commands:
  - `:candidates input`
  - `:fix input = output`
  - `:memory`
  - `:clear-memory`
- Light fuzzy loanword lookup for cases such as `orrDar`, `ordar`, and `order`.
- Tests for normalizer, candidate generator, ranker, phrase resolver, and transliteration.

### Changed

- Updated package version to `0.0.2`.
- Replaced the direct dictionary-first transliteration flow with:
  normalize, tokenize, phrase resolve, user memory, candidate generation, ranking, fallback parser.
- Moved rule data into `src/data/rules/`.
- Moved dictionary data into `src/data/dictionary/`.
- Updated README for v0.0.2 architecture and CLI usage.

### Known Limitations

- Still CLI-only; no IBus, Fcitx5, Wayland, GUI, tray, or system input method integration.
- Fuzzy matching remains conservative and deterministic.
- Candidate ranking is not yet deeply contextual.

## v0.0.1 - 2026-05-08

Initial terminal-only MVP release for the Bangla phonetic IME.

### Added

- Node.js ESM project scaffold with CLI entry points.
- Reusable transliteration engine exported via `transliterate(input, options)`.
- MVP candidate API via `getCandidates(input)`.
- Longest-match-first parser for Avro-style phonetic matching.
- Basic Bangla vowel, consonant, vowel sign, hasanta, and conjunct handling.
- Small dictionary for common MVP words and Avro-style spellings.
- Terminal CLI usage:
  - `node src/cli.js "ami bangla likhi"`
  - `node src/cli.js --interactive`
- Interactive mode with `:q` and `:quit` exit commands.
- Punctuation handling with ASCII full stop mapped to Bangla danda by default.
- Node built-in test coverage for words, sentences, punctuation, numbers, and candidates.
- Avro/ibus-avro attribution files:
  - `NOTICE.md`
  - `LICENSE-AVRO.md`

### Known Limitations

- This is not a system input method.
- No IBus, Fcitx5, Wayland, GUI, tray, or global typing integration yet.
- Rule coverage is intentionally small and not full Avro compatibility.
- Candidate generation currently returns only one transliteration.
- Ambiguous Banglish spellings still need a larger dictionary and suggestion system.
