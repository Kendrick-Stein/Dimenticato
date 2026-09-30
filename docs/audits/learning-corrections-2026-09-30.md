# Learning-record and vocabulary corrections (2026-09-30)

Initially inspected: `2a44af065820c6969d0b482ffb5684f05eb01400`. Final changes are based on updated main `017711ac4b6808928f42cb73b028c6e0a04573d4`, preserving the intervening shared-practice refactor, data cleanup, vocabulary tags, compact formatting and CI.
All reproduction data used isolated VM/localStorage fixtures, not user storage.

## Corrections

- Reset now includes the German/English module `*_sr` stores and French module `french_srs` / `french_daily`, alongside the shared stores. Language-scoped reset still preserves other languages, preferences and wordbook content.
- Backup merge recognizes those same keys without renaming keys, converting IDs or conflating the shared and module schemas. Per-word SRS merge chooses the later `lastReviewDate`; ties keep the local record. Daily merge supplements missing dates, retaining the local record for overlapping dates. It does not add overlapping daily counts, which could double-count the same backup.
- Upstream has already removed the duplicate German/English daily record calls. Preserve its single-owner shared MC flow and spelling wrapper. Remove the remaining 100 ms guessing-based deduplication, which could suppress legitimate consecutive answers; disabled answer controls reject repeated submissions. The spelling wrapper now reads the current language controller’s question start time, retaining correct per-question elapsed duration.
- French merged vocabulary retains explicit source feminine forms, display, printed notation, part of speech and source/frequency metadata. The existing translation-spelling mode accepts source-attested forms; accent checking remains strict. This change does not expand conjugation/typing grading to accept arbitrary gender or number forms.
- French one-line TXT lookup uses the full merged vocabulary; imported practice retains the same metadata. French typing uses the canonical headword, so display annotations such as `acteur (actrice)` are not treated as literal input answers.
- German course initialization clears the temporary disabled state once its data arrives and binds its controls once.
- Fixed four unterminated `'utf8'` strings in `scripts/vocabulary_merge_corrections.js`. This is a historical batch merge/generator: it reads `data/vocabulary.json` plus corrections and writes `data/vocabulary_fixed.json` and `vocabulary_fixed.js`. It was syntax-checked only, never executed; those alternate datasets are not the active vocabulary entrypoint. Its legacy input files are no longer tracked on current main and must be supplied separately if this historical script is ever used.

## Narrow Italian data review

The generated 27,117-entry `vocabulary.js` is unchanged, including its original raw translations. A small explicit registry, `data/italian-vocabulary-corrections.js`, applies five checked translation-field corrections in memory before application initialization. It matches both headword and rank and only replaces the known previous field value, preserving newer upstream edits, IDs, frequency, dictionary fields, tags, order and record count:

- `nel`: “in the”; 在……里（in + il）. [Larousse](https://www.larousse.com/en/dictionaries/italian-english/nel/25679) identifies the contracted preposition.
- `cento`: “hundred”; 一百. [Treccani](https://www.treccani.it/vocabolario/cento/) distinguishes 100 from the phrase *per cento*.
- `signorina`: 小姐；未婚女子, replacing corrupted text. [Sabatini–Coletti](https://dizionari.corriere.it/dizionario_italiano/S/signorina.shtml) supports the courtesy-title/noun senses.

`italian-vocabulary-review.json` records exact before/after values and a machine-readable review queue. The initial private-use-character scan found 20 Chinese entries, including the now-fixed `signorina`; 19 remain. The initial repeated-English-token scan flagged 55 entries with the same token at least four consecutive times. Updated main has independently removed those repetition patterns; the report retains their before/current text under `upstreamResolved`, without claiming their meanings were verified. The current scan finds zero such patterns. No pending entry is removed, rewritten, hidden or merged by this change.

### Loading, backup and external readers

`LangLoader.DATA.italian` loads the base followed by the correction registry, in order, before exposing the vocabulary to the app. Normal questions, browsing, Italian TXT auto-lookup and typing therefore read corrected records. No localStorage data is rewritten. System vocabulary is not embedded in learning-progress backups; new wordbooks auto-filled from it capture corrected meanings, while pre-existing custom wordbooks keep the user's own text.

Offline/daily scripts that read the raw base file must also apply the registry, for example `require('./data/italian-vocabulary-corrections.js').apply(entries)`, or execute both scripts in the loader order. Reading only `vocabulary.js` still yields the original generated text. The registry has a dependency-free CommonJS export for this purpose. This avoids a multi-megabyte generated-file replacement and keeps each reviewed correction small and auditable.

## Reproduction and verification

```sh
node tests/run-headless.js
node tests/test-learning-regressions.js
node tests/test-vocabulary-review.js
node scripts/validate_german_conjugations.js
node --check scripts/vocabulary_merge_corrections.js
git diff --check
```

The integrated regression harness loads `app-enhanced.js` and the real controllers, including reset/reload/re-answer, scope isolation, both daily answer modes, fast consecutive questions, backup merge, late German-course initialization and all 123 source feminine variants. The storage fixture now loads the enhanced module too, replacing its two misleading missing-module warnings with hard assertions. Display-only DOM and timers are stubbed; this is not full browser end-to-end certification.

Remaining scope: source-by-source review of flagged translations and broader dictionary quality. No whole-library rewrite, automatic correction of historical daily totals, production-data edit, merge or deployment is part of this change.
