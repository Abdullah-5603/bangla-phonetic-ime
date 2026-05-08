# Bangla Phonetic IME

A terminal-only Bangla phonetic transliteration engine in Node.js. It converts
Banglish or romanized Bangla text into Unicode Bangla from the command line.

Current version: `v0.0.2`

This is not a system input method yet. It does not implement IBus, Fcitx5,
Wayland, GTK, Qt, a GUI, tray app, Electron, Tauri, or global Linux typing. The
current scope is only the reusable JavaScript engine and terminal CLI.

## v0.0.2 Features

- Candidate-based transliteration pipeline.
- Phrase overrides such as `pre order => প্রি অর্ডার`.
- Dictionary-ranked common Bangla words.
- Loanword ranking for modern terms like `order`, `computer`, and `school`.
- Common correction and light fuzzy lookup for cases like `orrDar`.
- User correction memory with `learnCorrection(input, output)`.
- Interactive CLI commands for candidates, fixes, memory display, and clearing.

## Architecture

The engine is deterministic and modular:

```txt
input
  -> normalize input
  -> tokenize
  -> check phrase dictionary
  -> check user correction memory
  -> generate multiple candidates
  -> rank candidates
  -> return best output
```

Main modules:

- `src/engine/normalizer.js`
- `src/engine/tokenizer.js`
- `src/engine/phrase-resolver.js`
- `src/engine/candidate-generator.js`
- `src/engine/ranker.js`
- `src/engine/parser.js`
- `src/engine/user-memory.js`

Dictionary and rule data live under `src/data/`.

## Install

```sh
cd bangla-phonetic-ime
npm install
```

There are currently no runtime dependencies.

## Run

```sh
node src/cli.js "pre order"
```

Output:

```txt
প্রি অর্ডার
```

```sh
node src/cli.js "ami bangla likhi"
```

Output:

```txt
আমি বাংলা লিখি
```

## Interactive Mode

```sh
npm run dev
```

Commands:

```txt
:q
:quit
:candidates order
:fix pre order = প্রি অর্ডার
:memory
:clear-memory
:clear-memory --yes
```

Example:

```txt
> pre order
প্রি অর্ডার
> :candidates order
1. অর্ডার    score: 9500    source: loanword
2. অর্দের    score: 1200    source: phonetic
> :fix orrDar = অর্ডার
Saved: orrDar => অর্ডার
```

## Engine API

```js
import {
  getCandidates,
  learnCorrection,
  transliterate
} from "./src/engine/index.js";

transliterate("pri orrDar");
// "প্রি অর্ডার"

getCandidates("order");
// [
//   { text: "অর্ডার", score: 9500, source: "loanword", ... },
//   { text: "অর্দের", score: 1200, source: "phonetic", ... }
// ]

learnCorrection("orrDar", "অর্ডার");
```

## Adding Dictionary Words

Add common Bangla words to `src/data/dictionary/core-bangla.js`:

```js
export const coreBangla = {
  amar: [{ text: "আমার", score: 10000, source: "dictionary" }]
};
```

Add modern loanwords to `src/data/dictionary/loanwords.js`:

```js
export const loanwords = {
  order: [{ text: "অর্ডার", score: 9500, source: "loanword" }]
};
```

## Adding Phrase Overrides

Add phrase-level matches to `src/data/dictionary/phrases.js`:

```js
export const phrases = {
  "pre order": [{ text: "প্রি অর্ডার", score: 15000, source: "phrase" }]
};
```

Phrase matching is longest-match-first.

## User Corrections

In interactive mode:

```txt
> :fix pre order = প্রি অর্ডার
Saved: pre order => প্রি অর্ডার
```

Corrections are saved in `src/data/user/user-dictionary.json`.

## Test

```sh
npm test
```

## Punctuation

ASCII `.` is consistently mapped to the Bangla danda `।` by default:

```txt
pre order. => প্রি অর্ডার।
```

Pass `{ bengaliFullStop: false }` to `transliterate()` to keep ASCII full stops.

## Known Limitations

- This is still CLI-only and not a Linux input method.
- Rule coverage is intentionally small and not full Avro compatibility.
- Fuzzy matching is light and deterministic, not AI or ML.
- Contextual ranking is minimal.
- Candidate generation does not yet use a large cleaned frequency dictionary.
- English words may transliterate if they look like Bangla phonetic input.

## Future Plan

1. Bigger cleaned dictionary
2. Better fuzzy matching
3. Contextual ranking
4. IBus adapter
5. Fcitx5 adapter
6. Arch/Omarchy package

## License And Attribution

The MVP rule behavior is inspired by Avro Keyboard and ibus-avro. See
`NOTICE.md` and `LICENSE-AVRO.md` for attribution and license notes that must be
preserved if upstream Avro/ibus-avro rules are copied or ported into this
project.
