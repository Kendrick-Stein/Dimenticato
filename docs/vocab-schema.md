# Vocabulary schema v1

Every language ships **one** file, `data/vocab/<code>.js`. All four files have the
same shape, and one validator (`node scripts/validate_vocab.js`) checks them all.
The Python reader and writer live in `scripts/vocab_schema.py`. The adapters from
each pipeline's native shape live in `scripts/vocab_legacy.py`.

```js
(globalThis.DIM_VOCAB = globalThis.DIM_VOCAB || {}).fr = {
"meta":{"schema":1,"lang":"fr","name":"Français","count":24536,
        "builder":"…","licences":["…"],"sources":["…", "…"]},
"entries":[
{"word":"maison","pos":"noun","gender":"f","level":"A1","levelSource":"freq-band","rank":170,"freq":339.0,"zh":"房子；家","en":"house","src":3},
…
]};
```

There is one entry per line, so diffs stay reviewable. The file is a classic
script, so the site can load it without a build step, and Node can load it in a `vm`.

## Entry fields

| field | type | req. | meaning |
|---|---|---|---|
| `word` | string | ✓ | Headword and unique key. Progress (mastered sets, SRS) is keyed by it. Case is significant: German nouns keep their capital. |
| `display` | string | | How to show or speak it, when that differs from `word`: `die Maus`, `acteur (actrice)`, `répondre (à)`. |
| `pos` | enum | ~ | Primary part of speech: `noun properNoun verb adjective adverb pronoun determiner article preposition conjunction numeral interjection particle prefix suffix phrase abbreviation`. |
| `posAll` | enum[] | | All parts of speech when there is more than one. `posAll[0] === pos`. |
| `gender` | string | | Nouns only. Values are `m`, `f` or `n`, joined with `/` when several apply (`m/f`, `m/n`). |
| `level` | `A1`…`C2` | ✓ | CEFR level. |
| `levelSource` | enum | ✓ | Where the level came from. `official` is Goethe for German, `textbook` is 你好！法语 for French, `course` is the German course units, `freq-band` is frequency. |
| `rank` | int | ✓ | 1…N, dense. Frequency order within the language; there are no sentinels. |
| `freq` | number \| null | ✓ | [wordfreq](https://github.com/rspeer/wordfreq) occurrences per million, to 3 significant figures, the same for every language. `null` means unattested. |
| `zh` | string | ✓ | Main Chinese gloss. It contains no part-of-speech markers. |
| `zhAlt` | string[] | | Further Chinese senses from secondary sources. |
| `en` | string | | English gloss. English itself has none. |
| `forms` | object | | Grammar forms. See below. |
| `tags` | string[] | | Topic tags, e.g. `饮食` or `旅行` for French. |
| `src` | int | | Index into `meta.sources`, recording the provenance of this entry. |
| `legacyId` | string | | Pre-v1 progress key (German `de-00001`). Used only by the one-time progress migration. |

`forms` keys: `plural`, `feminine`, `principalParts` (`ist, war, ist gewesen`),
`construction` (`à`), `government` (`+ auf A`), `pluraleTantum` (true),
`pronominal` (true), `variants` (accepted alternative spellings).

Empty or false optional fields are omitted, never written as `""` or `null`. The
exception is `freq`, which is always present.

## Levels

These rules are the same for every language and are implemented in `vocab_schema.finalize`:

1. Entries are sorted by `rank`. Frequency bands are assigned by position:
   ≤600 A1 · ≤1500 A2 · ≤3000 B1 · ≤6000 B2 · ≤12000 C1 · the rest C2.
2. An external list (`official`, `textbook`, `course`) sets the level unless the
   frequency band is *easier*. A top-600 word is A1 whichever list introduced it.

## Builders and readers

Each builder keeps its own internal row shape and writes v1 through
`vocab_legacy.emit(lang, vocab_legacy.from_<lang>(rows), builder='scripts/<name>.py')`:

| File | Builder |
|---|---|
| `data/vocab/it.js` | `build_italian_vocabulary_tags.py` (POS / gender), `clean_italian_glosses.py` (gloss cleanup, in place) |
| `data/vocab/de.js` | `build_german_vocabulary.py` (includes the pgh.csv parser) |
| `data/vocab/en.js` | `build_english_vocab.py` |
| `data/vocab/fr.js` | `build_french_vocabulary.py` — `assemble` merges `data/vocab/src/fr-curriculum.js`, `data/vocab/src/fr-glossary.js` and the Lexique core layer |

`data/vocab/src/` holds build inputs only; the site never loads them. In
`fr.js`, `src` tells the layers apart: `课程整理…` = curriculum, a `总词汇表`
page = textbook glossary, the Lexique source = frequency core.

Readers: Python uses `vocab_schema.read_vocab(lang)`; Node uses
`scripts/vocab_node.js` (`loadVocab(lang)`, `sourceOf(data, entry)`).

## Validation

`scripts/validate_vocab.js` checks the schema for every language, then runs the
language's hook from `LANGS` (Italian MT-repetition scan and tagger gold rows;
German article-in-display, inflected-headword and budget checks; French
headword shape and unique `glossKey(zh)`).

## Adding a language

1. Add the code to `LANGS` in `scripts/vocab_schema.py`.
2. Produce entries with the fields above, then call `finalize()` and `write_vocab()`.
3. Add a row to `LANGS` in `scripts/validate_vocab.js` with the POS coverage floor and a few gold entries (and a `check` hook for language-specific rules).
4. Add a profile in `lib/languages.js` (including `files`, `accents`, `grammarGlobal`); routing, loading, storage keys and labels are derived from it. The header language switch is rendered from it too.
