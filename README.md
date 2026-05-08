# Bangla Phonetic IME

A terminal-only Bangla phonetic transliteration engine in Node.js.

Current version: `v0.0.5`

This remains CLI-only. There is no IBus, Fcitx5, Wayland, GTK, Qt, Electron,
Tauri, tray UI, or system-wide Linux input method in this version.

## v0.0.5 Features

- Adaptive statistical ranking on top of deterministic beam search.
- Sentence-level memory for repeatedly confirmed sentence patterns.
- Typo pattern learning with bounded confidence scores.
- Frequency, bigram, trigram, and grammar-pattern scoring.
- Online learning command for corrections, sentence memory, and typo memory.
- LRU caches for normalization, candidates, ngrams, typo lookup, and sentence memory.
- TSON-only project data for dictionaries, corpora, memory, frequency tables, and learning stores.
- Corpus ingestion and rebuild tools for scalable TSON workflows.
- Advanced evaluator with top-k, regression, typo, phrase, loanword, and sentence accuracy.

## Architecture

```txt
input
  -> normalize
  -> tokenize
  -> phrase resolution
  -> candidate generation
  -> contextual ranking
  -> adaptive ranking
  -> beam search
  -> sentence memory boost
  -> typo pattern correction
  -> best sentence output
```

Core modules:

- `src/engine/adaptive-ranker.js`
- `src/engine/beam-search.js`
- `src/engine/frequency-engine.js`
- `src/engine/typo-learner.js`
- `src/engine/sentence-memory.js`
- `src/engine/online-learning.js`
- `src/engine/evaluator.js`
- `src/engine/validator.js`
- `src/engine/cache.js`
- `src/utils/tson.js`

## TSON Data

All project-owned data uses `.tson`:

```txt
src/data/dictionary/core-bangla.tson
src/data/dictionary/loanwords.tson
src/data/dictionary/phrases.tson
src/data/dictionary/bigrams.tson
src/data/dictionary/trigrams.tson
src/data/dictionary/typo-patterns.tson
src/data/dictionary/frequency-table.tson
src/data/dictionary/grammar-patterns.tson
src/data/corpus/*.tson
src/data/user/*.tson
```

## Run

```sh
npm install
node src/cli.js "pre order korbo"
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
:q
:quit
:candidates order
:beam pre order korbo
:eval
:benchmark
:fix input = output
:learn input = output
:memory
:memory-stats
:ngram প্রি অর্ডার করবো
:explain pri odrer
:clear-memory
:clear-memory --yes
```

Learning example:

```txt
> :learn pre order korbo = প্রি অর্ডার করবো
Learned: pre order korbo => প্রি অর্ডার করবো
Sentence memory count: 4
Typo patterns learned: 0
```

Explain example:

```txt
> :explain pri odrer
Normalization: pri odrer
Candidates:
pri -> প্রি
odrer -> অর্ডার, অদ্রের
Typo match: odrer -> order
confidence: 0.88
Beam winner: প্রি অর্ডার
```

## Evaluation

```sh
npm run evaluate
```

Reports total, top-1, top-3, regression, typo, phrase, loanword, and sentence
accuracy.

## Benchmark

```sh
npm run benchmark
```

Reports throughput, latency, memory delta, beam-search cost, learning overhead,
ngram lookup cost, and cache hit rates.

## Corpus Tools

```sh
node tools/import-corpus.js input.tson output.tson Imported
node tools/clean-corpus.js src/data/corpus/common.tson
node tools/dedupe-corpus.js src/data/corpus/common.tson
node tools/build-frequency-table.js
node tools/build-ngrams.js
node tools/validate-tson.js
node tools/rebuild-all.js
```

## Test

```sh
npm test
```

## Known Limitations

- Corpus size is still small.
- Learning is deterministic and confidence-based, not neural.
- Typo learning uses conservative canonical inference.
- Sentence memory is exact-pattern oriented.
- No system input method integration yet.

## Future Roadmap

v0.0.6:

1. Probabilistic language model
2. Incremental ranking refinement
3. Personalized ranking profiles
4. Eventual Linux IME adapter layer
5. Async background corpus rebuilding
6. Possible WASM optimization

## License And Attribution

The MVP rule behavior is inspired by Avro Keyboard and ibus-avro. See
`NOTICE.md` and `LICENSE-AVRO.md` for attribution and license notes that must be
preserved if upstream Avro/ibus-avro rules are copied or ported into this
project.
