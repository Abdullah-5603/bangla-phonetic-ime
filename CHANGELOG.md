# Changelog

All notable changes to this project will be documented in this file.

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
