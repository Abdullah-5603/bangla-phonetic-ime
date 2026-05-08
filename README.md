# Bangla Phonetic IME

A Linux-focused Bangla phonetic transliteration engine in Node.js, aiming for
Avro Keyboard compatible phonetic behavior with a cleaner CLI-first and
IME-ready runtime.

Current version: `v0.0.8`

This project is not inventing a new phonetic system. The goal is to make typing
habits learned from Avro Keyboard on Windows and Android behave the same, or as
closely as possible, while keeping the engine modular and Linux-friendly.

This release is still engine and CLI focused. It includes an IBus prototype
boundary, but no GTK, Qt, Electron, Tauri, tray app, or polished desktop UI.

## v0.0.8 Features

- Avro-compatible deterministic rule priority.
- Avro compatibility corpus and compatibility score tooling.
- Avro rule, exception, vowel, conjunct, autocorrect, and known-behavior TSON seed files.
- Compatibility modules for rule loading, validation, scoring, and drift checks.
- Prototype IBus adapter boundary with Node bridge, session manager, keymap, preedit sync, and candidate window state.
- Adapter-neutral candidate, preedit, commit, and session protocols.
- Wayland/X11 desktop environment detection helpers.
- Arch/Omarchy packaging groundwork.
- CLI commands for compatibility checks and desktop/IBus status.

## Avro Compatibility Goal

The transliteration pipeline now gives known Avro-compatible behavior the
highest priority:

1. exact Avro compatibility rules
2. Avro exception behavior
3. user corrections
4. compatibility-safe contextual ranking
5. fuzzy fallback

Fuzzy matching and statistical ranking should not override known Avro behavior.
See `COMPATIBILITY.md` for compatibility status, known differences, and the
current test coverage.

## Basic Usage

```sh
npm install
npm start -- "ami bangla likhi"
```

Output:

```txt
আমি বাংলা লিখি
```

Interactive CLI:

```sh
npm run dev
```

Useful commands:

```txt
:candidates order
:beam pre order korbo
:explain pri odrer
:stream
:compat rri
:compat-report
:ibus-status
:desktop
:q
```

## Compatibility Tools

Run the Avro compatibility corpus:

```sh
npm run compatibility
```

Replay or compare compatibility data:

```sh
node tools/replay-avro-corpus.js
node tools/compare-with-avro.js
node tools/generate-compatibility-report.js
```

Example interactive check:

```txt
> :compat rri
Expected (Avro): ঋ
Actual: ঋ
Compatibility: PASS
```

## IBus Prototype

The IBus code is intentionally isolated from the engine core:

```txt
src/adapters/ibus/
src/adapters/protocol/
```

The current adapter is prototype groundwork. It defines bridge/session/preedit
and candidate synchronization boundaries, but it is not production-ready desktop
integration.

Check adapter status:

```sh
npm run ibus:status
```

## Data Format

All project-owned runtime data uses `.tson`:

```txt
src/data/avro/*.tson
src/data/dictionary/*.tson
src/data/corpus/*.tson
src/data/linux/*.tson
src/data/profiles/*.tson
src/data/user/*.tson
```

`package.json` remains the npm-required metadata exception.

Validate TSON files:

```sh
npm run validate:tson
```

## Evaluation

```sh
npm run evaluate
```

Reports total, top-1/top-3, regression, typo recovery, phrase, loanword,
sentence, streaming, and language-model metrics.

## Benchmark

```sh
npm run benchmark
```

Reports full-sentence latency, per-key streaming latency, suggestion latency,
commit latency, cache statistics, memory delta, and language-model overhead.

## Tests

```sh
npm test
```

## Packaging Status

Prototype packaging files are included:

```txt
packaging/PKGBUILD
packaging/arch-install.sh
packaging/omarchy-install.sh
packaging/ibus-register.sh
packaging/uninstall.sh
```

They are groundwork only. Real AUR/package repository testing is planned for a
future release.

## Wayland/X11 Notes

The project can detect desktop session context and IBus availability for status
reporting. It does not yet install or activate a system input method.

## Known Limitations

- The Avro compatibility corpus is still small and manually curated.
- Full upstream Avro/ibus-avro rule tables have not been completely ported.
- The IBus adapter is a prototype boundary, not a production engine.
- Candidate pagination and rich candidate window behavior are not implemented.
- Cursor movement support remains limited.
- Arch/Omarchy packaging has not been validated in a real package repository.

## Future Roadmap

v0.0.9:

1. Fcitx5 prototype adapter
2. Real desktop testing
3. Candidate pagination
4. Cursor movement support
5. IME persistence
6. Package repository preparation
7. Arch/AUR testing

## License And Attribution

The project is inspired by Avro Keyboard and ibus-avro behavior. Preserve
MPL-compatible attribution when Avro-derived rules or datasets are referenced or
ported. See `NOTICE.md`, `LICENSE-AVRO.md`, and `COMPATIBILITY.md`.
