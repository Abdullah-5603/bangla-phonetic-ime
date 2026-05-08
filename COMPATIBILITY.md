# Avro Compatibility

## Goal

This project aims for full behavioral compatibility with Avro Keyboard phonetic
typing rules while keeping a Linux-first, modular runtime suitable for IBus and
future Fcitx adapters.

The project does not clone Avro UI, assets, or branding.

## Current Status

v0.0.8 includes a curated Avro compatibility seed corpus and exact compatibility
rules for common and high-priority cases:

- basic words such as `ami`, `tumi`, `bangla`
- conjunct cases such as `shikkha`, `ksh`, `kSh`, `kkh`
- vowel case `rri => ঋ`
- complex seeded behavior `khuje => খুঁজে`
- loanword phrases such as `pre order`

Current compatibility command:

```sh
npm run compatibility
```

Current seed result:

```txt
Compatibility Score: 100.0%
Passed: 14/14
```

## Known Differences

- The full official Avro rule table has not yet been ported.
- Autocorrect coverage is a small curated seed.
- Some rare conjuncts and legacy edge cases are not represented yet.
- Candidate ordering is engine-specific outside exact compatibility rules.
- IBus support is prototype-only and not production desktop integration.

## Unsupported Edge Cases

- Complete Avro dictionary/autocorrect behavior.
- Full punctuation behavior parity.
- Full old Avro conjunct edge cases.
- Desktop candidate-window pagination behavior.

## Compatibility Test Status

Compatibility corpus:

```txt
src/data/avro/avro-compatibility-corpus.tson
```

Compatibility modules:

```txt
src/adapters/compatibility/
```

Compatibility tooling:

```txt
tools/compatibility-check.js
tools/compare-with-avro.js
tools/replay-avro-corpus.js
tools/generate-compatibility-report.js
```
