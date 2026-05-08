# Bangla Phonetic IME

Linux-focused Bangla phonetic transliteration engine (Node.js) with Avro-compatible behavior.

Current version: `v0.0.9`

## v0.0.9 Focus

- Implements Avro Phonetic behavior from PDF-spec TSON data.
- Separates exact transliteration from smart suggestions.
- Preserves case-sensitive rules (`O`, `OI`, `OU`, `T`, `D`, `N`, `Sh`, `S`, `Ng`, `NG`).
- Disables legacy custom phonetic table as primary parser.
- Keeps streaming/session architecture and IBus prototype boundary.

## Modes

- `avro-strict` (CLI default): exact PDF-spec output only.
- `avro-smart`: PDF-spec output plus dictionary/phrase suggestions.

## CLI

```sh
node src/cli.js --mode avro-strict "colO zay, ghure asshi"
node src/cli.js --mode avro-smart "colO zay, ghure asshi"
```

Interactive:

```sh
npm run dev
```

Commands:

```txt
:mode avro-strict
:mode avro-smart
:avro input
:smart input
:rule input
:compat-report
```

## Compatibility

```sh
npm run compatibility
```

Compatibility corpus and rule tables are under:

```txt
src/data/avro/pdf-spec-*.tson
```

## Benchmarks

```sh
npm run benchmark
```

Reports strict and smart mode throughput/latency separately.

## Validation and Tests

```sh
npm test
npm run evaluate
npm run compatibility
npm run validate:tson
```

## Data Format

Project runtime data uses `.tson` under `src/`, `test/`, and `tools/` (with npm-required `package.json` exception).

## Scope Notes

- Fully offline.
- No cloud APIs.
- No ML frameworks.
- No GUI integration in this release.
- IBus/Fcitx production integration is intentionally deferred.

## Attribution

Behavior target is Avro/ibus-avro compatibility.  
See `NOTICE.md`, `LICENSE-AVRO.md`, and `COMPATIBILITY.md`.
