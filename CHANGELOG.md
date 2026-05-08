# Changelog

All notable changes to this project will be documented in this file.

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
