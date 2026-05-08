# Bangla Phonetic IME

A terminal-only Bangla phonetic transliteration engine in Node.js. It converts
Banglish or romanized Bangla text into Unicode Bangla from the command line.

Current version: `v0.0.4`

This is still CLI-only. It does not implement IBus, Fcitx5, Wayland, GTK, Qt,
Electron, Tauri, tray UI, or system-wide Linux typing.

## v0.0.4 Features

- Sentence-level candidate graph generation.
- Beam search over sentence paths with configurable beam width.
- Contextual transition scoring with bigram and phrase likelihoods.
- TSON-backed dictionaries for core words, loanwords, phrases, corrections, and bigrams.
- Bounded Damerau-Levenshtein fuzzy matching for longer high-confidence loanword keys.
- Bangla output validation penalties for repeated hasanta, malformed kar ordering, and suspicious repetition.
- Offline evaluation corpus with category accuracy and failed-case reporting.
- Regression corpus for previously fixed behavior.
- Benchmark tool for latency, throughput, memory, and beam-search cost.

## Architecture

```txt
input
  -> normalize
  -> tokenize
  -> phrase resolution
  -> generate candidates per token
  -> build sentence candidate graph
  -> contextual transition scoring
  -> beam search
  -> best sentence output
```

Main engine modules:

- `src/engine/transliterate.js`
- `src/engine/graph-builder.js`
- `src/engine/beam-search.js`
- `src/engine/contextual-ranker.js`
- `src/engine/transition-scorer.js`
- `src/engine/candidate-generator.js`
- `src/engine/evaluation.js`
- `src/engine/user-memory.js`

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
:fix pre order = প্রি অর্ডার
:memory
:clear-memory
:clear-memory --yes
```

Beam example:

```txt
> :beam pre order korbo
1. প্রি অর্ডার করবো   score: 56700
2. প্রি অর্ডার করব   score: 43900
3. প্রি অর্ডার কোর্বো   score: 36100
```

## Engine API

```js
import {
  getCandidates,
  learnCorrection,
  searchSentence,
  transliterate
} from "./src/engine/index.js";

transliterate("pri odrer");
// "প্রি অর্ডার"

getCandidates("order")[0].text;
// "অর্ডার"

searchSentence("pre order korbo", { beamWidth: 5 }).best.outputs.join("");
// "প্রি অর্ডার করবো"

learnCorrection("orrDar", "অর্ডার");
```

## TSON Data

Dictionary data is stored in compact TSON files:

```txt
src/data/dictionary/core-bangla.tson
src/data/dictionary/loanwords.tson
src/data/dictionary/phrases.tson
src/data/dictionary/bigrams.tson
src/data/dictionary/corrections.tson
src/data/user/user-memory.tson
```

Candidate dictionary rows:

```txt
input	output	score	source
order	অর্ডার	9500	loanword
```

Bigram score rows:

```txt
previous current	score
প্রি অর্ডার	15000
```

Project dictionaries, corpus, and user memory are stored as TSON.

## Evaluation

```sh
npm run evaluate
```

Output includes total accuracy, category accuracy, and failed cases.

```txt
Total Accuracy: 100.0%

Category Accuracy:
- Common Bangla: 100.0% (4/4)
- Loanwords: 100.0% (4/4)
- Phrases: 100.0% (4/4)
- Mixed: 100.0% (4/4)
- Edge Cases: 100.0% (3/3)
- Regressions: 100.0% (9/9)
```

Regression cases live in `src/data/corpus/regressions.tson`.

## Benchmark

```sh
npm run benchmark
```

Reports:

- transliterations/sec
- average latency
- memory delta
- beam search cost

## Test

```sh
npm test
```

## Known Limitations

- Corpus is still small.
- Contextual scoring is deterministic heuristics, not ML.
- Fuzzy matching is intentionally bounded and conservative.
- Bangla grammar heuristics cover only a few MVP cases.
- No system IME integration yet.

## Future Roadmap

v0.0.5:

1. Larger corpus
2. Better context learning
3. Sentence memory
4. Online learning
5. Eventual Linux IME integration

## License And Attribution

The MVP rule behavior is inspired by Avro Keyboard and ibus-avro. See
`NOTICE.md` and `LICENSE-AVRO.md` for attribution and license notes that must be
preserved if upstream Avro/ibus-avro rules are copied or ported into this
project.
