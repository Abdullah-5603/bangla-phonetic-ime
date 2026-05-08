# Bangla Phonetic IME

A terminal-only Bangla phonetic transliteration engine in Node.js.

Current version: `v0.0.7`

This remains CLI-only. There is no IBus, Fcitx5, Wayland, GTK, Qt, Electron,
Tauri, tray UI, or system-wide Linux input method in this version.

## v0.0.7 Features

- Streaming session API for per-keystroke composition.
- Preedit and commit behavior simulation.
- Real-time suggestion engine for partial input.
- Incremental candidate updates with session-local caches.
- Backspace over roman input with Bangla preedit recomputation.
- Latency monitor for processKey, suggestion, candidate, preedit, and commit timing.
- Adapter-neutral IME contract APIs.
- Streaming evaluation corpus and metrics.
- Benchmark metrics for per-key process latency, suggestion latency, preedit latency, commit latency, and session memory use.
- Larger manually curated TSON language-model seed.

## Streaming Model

The engine now supports both full sentence transliteration and IME-style streaming:

```js
import { createStreamingSession } from "./src/engine/index.js";

const session = createStreamingSession();
session.processText("ami");
session.getPreedit();
// "আমি"

session.processKey({ key: " " });
session.getCommittedText();
// "আমি "
```

Backspace removes from the roman buffer, then recomputes preedit:

```js
session.processText("ami");
session.backspace();
session.getPreedit();
// "আম"
```

## IME Contract

`src/engine/ime-contract.js` defines the adapter-neutral boundary:

```js
createInputSession();
processKeyEvent(session, event);
getPreeditText(session);
getCandidateList(session);
commitCandidate(session, index);
resetComposition(session);
```

This is only an internal contract for future IBus/Fcitx work. It does not talk to
Linux desktop APIs.

## CLI Streaming

Direct simulation:

```sh
node src/cli.js --stream "ami bangla"
```

Example output:

```txt
key: a    preedit: আ
key: m    preedit: আম
key: i    preedit: আমি
key: SPACE committed: আমি
```

Interactive simulation:

```txt
> :stream
stream> a
preedit: আ
suggestions:
1. আ
2. অ
stream> m
preedit: আম
stream> i
preedit: আমি
stream> SPACE
committed: আমি
stream> :exit
```

Stream commands:

```txt
:candidates
:select 1
:latency
:exit
```

## Data Format

All project-owned runtime data uses `.tson`:

```txt
src/data/dictionary/*.tson
src/data/corpus/*.tson
src/data/profiles/*.tson
src/data/user/*.tson
```

`package.json` remains the npm-required metadata exception.

## Evaluation

```sh
npm run evaluate
```

Includes:

- total accuracy
- top-1/top-3 accuracy
- regression accuracy
- typo recovery accuracy
- preedit accuracy
- final commit accuracy
- backspace behavior accuracy
- session reset accuracy

## Benchmark

```sh
npm run benchmark
```

Includes:

- full sentence transliteration/sec
- average full sentence latency
- per-key process latency
- suggestion generation latency
- preedit update latency
- commit latency
- cache hit rates
- memory delta

## Tests

```sh
npm test
```

## Known Limitations

- Streaming mode is a CLI simulation only.
- Candidate window protocol mapping is not implemented yet.
- Cursor movement support is minimal.
- The suggestion engine is deterministic and small.
- No actual Linux IME adapter is included.

## Future Roadmap

v0.0.8:

1. Actual IBus prototype adapter
2. Candidate window protocol mapping
3. Linux desktop testing
4. Wayland/X11 compatibility notes
5. Packaging prep for Arch/Omarchy

## License And Attribution

The MVP rule behavior is inspired by Avro Keyboard and ibus-avro. See
`NOTICE.md` and `LICENSE-AVRO.md` for attribution and license notes that must be
preserved if upstream Avro/ibus-avro rules are copied or ported into this
project.
