# Module data schema v1

Vocabulary already shares one format across languages (`docs/vocab-schema.md`).
This document defines the shared format for the **optional modules**:
`conjugations`, `grammar`, `collocations`, `cognates` and `course`. After this
change, feature code never branches on language and holds no per-language config
tables. Anything that differs by language (person labels, tense names, preposition
keys) lives in the data's `meta`, and the code reads it from there.

## Shared conventions

Every module file is a classic script ending with the existing footer
(`scripts/data_module.py`):

```js
(globalThis.DIM_DATA.<module> = globalThis.DIM_DATA.<module> || {}).<code> = { "meta": {…}, … };
```

- `<code>` is the two-letter language code (`it de en fr`) everywhere. This
  applies to `meta.lang` too. Never use `italian`, `english` or `null` for a language.
- Each module file is `data/<code>-<module>.js` (for example `data/de-conjugations.js`,
  `data/it-grammar.js`), listed under `files.<module>` in the language's profile in
  `lib/languages.js`. A language has a module if and only if its profile lists one.
- `meta` is required and holds at least:
  `{ "schema": "<module>/1", "lang": "<code>", "name": "…", "count": N, "builder": "scripts/…", "sources": […], "licences": […] }`.
- Field names are the same as in vocabulary:
  - `word` is the headword (never `italian` / `german` / `infinitive` / `french`).
  - `zh` is the Chinese gloss and `en` the English gloss.
  - `pos` uses the vocab POS enum (`noun verb adjective …`). Values like `Verb`, `adj.` or `verbe` are not allowed.
  - `gender` uses the vocab rules, with combos in fixed order: `m`, `f`, `n`, `m/f`, `m/n`, `f/n`, `m/f/n`.
  - `level` is `A1`…`C2`.
  - `freq` is occurrences per million (wordfreq), or `null`.
  - `rank` is an integer.
- Language-specific data with no shared meaning goes under one optional object,
  `x: {…}`, on the record. Shared code may display it generically but must not
  depend on it.
- Optional fields are omitted when empty, not written as `""` or `null`
  (`freq` is the exception).
- One record per line where practical, so diffs stay reviewable.

## conjugations/1

```js
{
  "meta": {…, "schema": "conjugations/1"},
  "persons": [ {"key":"p1","label":"io","zh":"我"}, … 6 items, keys p1…p6 ],
  "tenses":  [ {"key":"indicativo_presente","group":"indicativo","groupLabel":"Indicativo",
                "label":"Presente","zh":"直陈式现在时","type":"person"|"single","level":"A1"?}, … ],
  "verbs": [
    {"word":"essere","rank":1,"freq":…,"zh":"是","en":"to be",
     "tenses":{"indicativo_presente":["sono","sei","è","siamo","siete","sono"],
               "participio_passato":"stato", …},
     "x":{ …lang-specific, e.g. auxiliary, separable, model… }}
  ]
}
```

- A person-type tense is an array of 6 aligned with `persons`. A missing form is
  `null` (for example 1st-person imperative).
- A single-type tense is a string.
- `tenses[]` order is the display order. `group` lets the UI group tenses into moods.
- Every verb has `zh`, including Italian (fill it from `data/vocab/it.js`).
- Alternatives inside one slot are joined with `/` (`"stato/stata/stati/state"`,
  `"hanged/hung"`); the UI shows them as `a / b` and accepts any of them.
- `verbs[]` is sorted by `rank` (dense, 1…N). There is no `lessons` array: the
  practice UI cuts lessons as fixed-size frequency chunks of `verbs[]`.

Optional parts (read generically by `conjugation-app.js` / `typing-game-app.js`):

| Field | Meaning |
|---|---|
| `meta.groups: [{key,label,zh}]` | Mood rows of the tense matrix, in order. Every `tense.group` is one of these keys. |
| `meta.placeholders: {lookup,typing}` | Example text for the lookup box and the typing input. |
| `meta.elision: {contract:{p1:"j'"}, vowel:"<regex source>", aspirate:[…], aspirateVerbs:[…]}` | Subject-pronoun elision (fr): `contract` replaces the pronoun before a form matching `vowel`, except for words in `aspirate` / verbs in `aspirateVerbs` (h aspiré). |
| `persons[].pronouns: […]` | Pronouns accepted as a typed prefix (`il/elle/on`). |
| `tense.time: "present"\|"past"\|"future"` | Column of the tense matrix; tenses without `time` are listed under 其他时态. |
| `tense.omit: ["p1", …]` | Persons that do not exist in this tense (imperative); their slots are `null`. |
| `tense.labels: {p3:"Lei", …}` | Per-tense person label overrides. |
| `tense.subject: true` | Tables print the subject pronoun with the form (`je parle`, `j'ai`; fr). Forms themselves never contain the subject. |
| `tense.level` | CEFR level of the tense. |
| `x.zhSource: "pivot:<code>"\|"manual"` | `zh` is not from `data/vocab/<lang>.js` (it: EN pivot or hand gloss); recomputed on every canonicalisation. |

`scripts/canonical_conjugations.py <code>` rewrites a data file into this shape
(the builders write the old per-verb `forms` objects and call it at the end); it
is idempotent.

Hand-checked corrections live in `scripts/conjugation_fixes/<code>.json`, as
`{verb, tense, person, from, to, why}`. `tense` is a tense key, or `x.<field>`
for metadata. `person` is 0–5, or null for single-form tenses and metadata.
`to: null` deletes a metadata field. They are applied on every
canonicalisation, so a rebuild cannot bring an audited error back.
- A cell already equal to `to` is skipped.
- A cell matching neither `from` nor `to` is reported as stale and left alone.
  Re-check that entry against the new upstream data.

## cognates/1

```js
{ "meta": {…, "schema":"cognates/1", "patterns": {"<patternKey>": {"label":"…","zh":"…"}}},
  "entries": [ {"word":"nazione","display"?, "pos":"noun","gender"?,"en":"nation","zh":"国家",
                "pattern":"<patternKey>","similarity":0.86,"difficulty":1,"rank":…,"level"?,
                "falseFriend"?:{…},"x"?:{…}} ] }
```

## collocations/1

```js
{ "meta": {…, "schema":"collocations/1"},
  "keys": [ {"key":"a","label":"a","kind":"preposition"|"particle"|"case"|"object","zh"?} , … ],
  "verbs": { "<word>": {"word":"…","display":"…","zh"?,"level"?,"order":["a","di"],
             "keys": {"a": [ {"text":"pensare a qualcuno","zh":"想念某人"} ]},
             "x"?:{…}} },
  "index": { "<key>": ["<word>", …] } }
```

- Examples are `{text, zh}` objects, not `"text 中文"` strings.
- German case info belongs on the key, e.g. `{"key":"an+A","label":"an + Akk.","kind":"preposition","case":"A"}`.

## grammar/1

```js
{ "meta": {…, "schema":"grammar/1", "levels":["A1",…], "topicCount":N, "aliases":{ "<old slug>":"<new slug>" }},
  "tree": {"parts":[{"title":"…","slug":"p1","chapters":[{"title":"…","slug":"p1/ch01",
           "topics":[{"title":"…","slug":"p1/ch01/t01","level":"A1"}]}]}]},
  "content": { "<topic slug>": "markdown" } }
```

- Slugs are ASCII and follow `p<N>`, `p<N>/ch<NN>`, `p<N>/ch<NN>/t<NN>` in every language.
- Every topic has a `level`.
- Old slugs map to new ones through `meta.aliases`, so saved links and course references keep resolving.

## course/1

Any language may ship a course. The data file is `data/<code>-course.js`, and its profile lists it under `files.course`.

```js
{ "meta": {…, "schema":"course/1", "title":"…", "zh":"…"},
  "levels": [ {"id":"A1","title":"…","zh":"…","description":"…",
     "units":[ {"id":"A1-01","number":1,"title":"…","summary":"…",
                "words":["<vocab word>", …], "grammar":[ {"label":"…","slug":"<grammar slug>"} ] } ] } ] }
```

- Every `words[]` item must exist in the language's vocab.
- Every grammar `slug` must exist in that language's grammar tree.

## Validation

`scripts/validate_modules.js` validates every module file against this document
for every language. It is run by `npm test`.
