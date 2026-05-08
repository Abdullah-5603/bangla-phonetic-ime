# Bangla Phonetic IME

A terminal-only MVP for an Avro-like Bangla phonetic typing engine. It converts
Banglish or romanized Bangla text into Unicode Bangla from the command line.

This is not a system input method yet. It does not implement IBus, Fcitx,
Wayland integration, a GUI, tray app, or global Linux typing. The current scope
is only the reusable JavaScript engine and a terminal interface.

## Install

```sh
cd bangla-phonetic-ime
npm install
```

There are currently no runtime dependencies.

## Run

```sh
node src/cli.js "ami bangla likhi"
```

Output:

```txt
আমি বাংলা লিখি
```

```sh
node src/cli.js "amar sonar bangla"
```

Output:

```txt
আমার সোনার বাংলা
```

## Interactive Mode

```sh
npm run dev
```

Type romanized Bangla and press Enter to see Bangla output.

```txt
> ami bangla likhi
আমি বাংলা লিখি
> :q
```

Use `:q` or `:quit` to exit.

## Test

```sh
npm test
```

## Engine API

```js
import { transliterate, getCandidates } from "./src/engine/index.js";

transliterate("ami bangla likhi");
// "আমি বাংলা লিখি"

transliterate("shikkha");
// "শিক্ষা"

transliterate("dhonnobad");
// "ধন্যবাদ"

getCandidates("ami");
// ["আমি"]
```

## Current Scope

- Longest-match-first phonetic parser
- Basic vowels and vowel signs
- Basic consonants
- Minimal hasanta/conjunct handling
- Small MVP dictionary for common Avro-style words
- Punctuation and number preservation

## Known Limitations

- This is not full Avro compatibility.
- Many ambiguous Banglish spellings still need dictionary support.
- English words may be transliterated if they look like phonetic Bangla input.
- Candidate generation currently returns only the top transliteration.

## Future Plan

1. Improve Avro rule compatibility
2. Add dictionary suggestions
3. Add IBus adapter
4. Add Fcitx5 adapter
5. Package for Arch/Omarchy

## License And Attribution

The MVP rule behavior is inspired by Avro Keyboard and ibus-avro. See
`NOTICE.md` and `LICENSE-AVRO.md` for attribution and license notes that must be
preserved if upstream Avro/ibus-avro rules are copied or ported into this
project.
