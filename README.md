# Bangla Phonetic IME

A terminal-only Bangla phonetic transliteration engine in Node.js.

Current version: `v0.0.6`

This remains CLI-only. There is no IBus, Fcitx5, Wayland, GTK, Qt, Electron,
Tauri, tray UI, or system-wide Linux input method in this version.

## v0.0.6 Features

- Lightweight statistical language model with unigram, bigram, trigram, and quadgram scoring.
- Probabilistic sentence-level ranking on top of contextual and adaptive beam scoring.
- Profile-aware ranking with `default`, `coding`, `commerce`, and `personal` profiles.
- Smarter typo canonicalization using learned typo confidence plus bounded edit distance.
- Runtime state for hot adaptation, profile usage, rebuild queue status, and cache reporting.
- Async-safe background rebuild boundary.
- Incremental training pipeline for runtime learning cases.
- IME-ready adapter boundary APIs without Linux IME integration.
- TSON-only project data for dictionaries, corpora, profiles, memory, and evaluation data.

## Architecture

```txt
input
  -> normalize
  -> tokenize
  -> phrase resolution
  -> candidate generation
  -> contextual ranking
  -> adaptive ranking
  -> probabilistic language-model scoring
  -> profile scoring
  -> beam search
  -> best sentence output
```

Core modules:

- `src/engine/language-model.js`
- `src/engine/probabilistic-ranker.js`
- `src/engine/profile-manager.js`
- `src/engine/typo-canonicalizer.js`
- `src/engine/incremental-trainer.js`
- `src/engine/background-rebuilder.js`
- `src/engine/runtime-state.js`
- `src/engine/ime-adapter-boundary.js`

## TSON Data

All project-owned runtime data uses `.tson`:

```txt
src/data/dictionary/language-model.tson
src/data/dictionary/quadgrams.tson
src/data/profiles/default.tson
src/data/profiles/coding.tson
src/data/profiles/commerce.tson
src/data/profiles/personal.tson
src/data/corpus/*.tson
src/data/user/*.tson
```

`package.json` remains the npm-required metadata exception.

## Run

```sh
npm install
node src/cli.js "pri odrer korbo"
```

Output:

```txt
প্রি অর্ডার করবো
```

## Interactive CLI

```sh
npm run dev
```

Commands:

```txt
:profile coding
:profiles
:lm প্রি অর্ডার করবো
:perplexity
:runtime-stats
:rebuild-status
:explain pri odrer
:beam pri odrer korbo
:learn input = output
```

Language-model example:

```txt
> :lm প্রি অর্ডার করবো
Unigram: 26.70
Bigram: 28.30
Trigram: 20.00
Quadgram: 0.00
Final LM Score: 43.40
```

Profile example:

```txt
> :profiles
coding
commerce
default
personal
> :profile coding
active profile: coding
```

## IME Boundary

`src/engine/ime-adapter-boundary.js` provides future-facing session APIs only:

```js
createSession();
processKeystroke(session, "a");
getSuggestions(session);
commitCandidate(session, candidate);
resetSession(session);
destroySession(session);
```

This is not an IBus/Fcitx/Wayland integration.

## Evaluation

```sh
npm run evaluate
```

Reports total accuracy, top-k accuracy, regression accuracy, typo recovery,
sentence coherence, profile-aware accuracy, and LM perplexity.

## Benchmark

```sh
npm run benchmark
```

Reports latency, throughput, probabilistic ranking cost, language-model lookup
cost, profile overhead, background rebuild overhead, runtime adaptation overhead,
and cache stats.

## Tools

```sh
npm run validate:tson
npm run lm:build
npm run rebuild
npm run memory:report
node tools/incremental-train.js input expected
node tools/rebuild-runtime-state.js
node tools/profile-builder.js profile.tson term boost
```

## Test

```sh
npm test
```

## Known Limitations

- The language model is small and hand-seeded.
- Probabilities are lightweight log-score heuristics, not neural modeling.
- Profile files are static TSON boosts.
- Runtime rebuild is an architecture-safe queue, not a full background worker yet.
- No system input method integration yet.

## Future Roadmap

v0.0.7:

1. Partial keystroke streaming
2. Real-time suggestion engine
3. Incremental candidate updates
4. Latency optimization for IME usage
5. Eventual IBus/Fcitx adapters
6. Possible WASM optimization

## License And Attribution

The MVP rule behavior is inspired by Avro Keyboard and ibus-avro. See
`NOTICE.md` and `LICENSE-AVRO.md` for attribution and license notes that must be
preserved if upstream Avro/ibus-avro rules are copied or ported into this
project.
