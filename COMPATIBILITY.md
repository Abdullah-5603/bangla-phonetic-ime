# Avro PDF-Spec Compatibility

## Goal

`v0.0.9` prioritizes **official Avro Phonetic PDF-spec behavior** over custom or fuzzy transliteration rules.  
The engine is Linux/Arch/Omarchy-focused, fully offline, and does not copy official Avro UI/branding/assets.

## Modes

- `avro-strict`: exact PDF-spec transliteration only (case-sensitive, no fuzzy override)
- `avro-smart`: PDF-spec output + optional dictionary/phrase suggestions (exact output remains visible as `avro-pdf`)

## Source Data

The PDF-spec layer is encoded in:

```txt
src/data/avro/pdf-spec-vowels.tson
src/data/avro/pdf-spec-consonants.tson
src/data/avro/pdf-spec-kars.tson
src/data/avro/pdf-spec-special-rules.tson
src/data/avro/pdf-spec-fola.tson
src/data/avro/pdf-spec-compatibility-corpus.tson
```

## Compatibility Command

```sh
npm run compatibility
```

Current report format:

```txt
PDF Spec Cases: X/Y passed
Case-sensitive Rules: X/Y passed
Accent Rules: X/Y passed
Compatibility Score: Z%
Known Gaps: ...
```

## Known Gaps

- Fola/jukto-consonant edge behavior is not fully ported from the full upstream Avro stack.
- Coverage is based on manually encoded PDF-accessible examples and regressions.
- Desktop IME UI behavior (IBus/Fcitx production UX) remains outside v0.0.9 scope.
