# Curated multilingual reading

## Public UI

The `#/it/reading` index (also `de`, `en`, `fr`) offers editorial CEFR filters. An article has a permanent `#/it/reading/article/<id>` link. One top-level control shows or hides all body translations. Sentence audio is opt-in through the top-level “逐句朗读” toggle; the default reading flow contains no repeated sentence toolbar. Both controls expose their state with `aria-pressed`, and individual audio buttons have sentence-number labels. Marking an article read is local-only, reversible and included in the existing export/import/reset scope through `DimStorage.key(lang, 'reading_progress')`.

Each underlined word has a curated sentence-specific gloss. Selecting a word in the foreign text uses the same lookup; exact current-language vocabulary headwords are the fallback and are explicitly not context-disambiguated. Unknown inflections and arbitrary phrases do not receive fabricated translations. No translation API is called. `App.speak` uses the existing browser speech synthesis and the article language; device voices and pronunciation quality vary.

## Edition contract

`data/reading/index.json`: `{ "schema": 1, "articles": [...] }`. Each index row contains `id, lang, date, title, titleZh, summaryZh, level`, copied exactly from its article, plus `sourceLang` / `sourcePublishedAt` copied from `source.lang` / `source.publishedAt` and optional `contentType`. Cards show original publication and edition dates separately. Same-day native-source adaptations sort ahead of legacy editions; dates remain newest-first. Article files live at `data/reading/articles/<id>.json`; lowercase ASCII IDs are immutable.

Each article requires:
- `schema: 1`, stable `id`, cross-language `storyId`, `lang` (it/fr/de/en), edition `date` (YYYY-MM-DD)
- foreign `title`, `titleZh`, `summaryZh`, a single `level` (A1–C2), and `levelReason`. Levels are editor estimates, not certified CEFR assessments.
- `source: {name, title, url, publishedAt, lang}`: actual original publication date and language, separate from edition date
- `license: {name, url}`, `attribution`, `adaptation`: precise copyright basis and disclosure of translation/simplification
- `sentences: [{id, text, zh, glosses: [{surface, lemma, zh, note?}]}]`. `surface` must occur verbatim in that sentence. Prefer individual words for clickable annotations. A selected multiword surface may use a curated gloss, otherwise only sentence translation is offered.

New editions use `contentType: "native-adaptation"` only when the editorial review verifies a institutional original in the article language and `source.lang === lang`. The UI says “原语机构来源 · 同语言改写”, without asserting a publisher-certified drafting language. This is an editorial claim, not something language-code equality alone proves. Such editions require a learning summary. Legacy articles may omit both fields; cross-language adaptations are labeled explicitly and missing summaries are disclosed rather than generated from guesses.

`learningSummary` has three nonempty groups:
- `words: [{text, zh, sentenceId, lemma?, note?}]` for essential words
- `phrases: [{text, zh, sentenceId, lemma?, note?}]` for useful phrases
- `sentences: [{sentenceId, note}]` for memorable sentences and a concrete learning point

Each word/phrase `text` must occur verbatim in the referenced sentence. Sentence quotations reuse that sentence's foreign text and Chinese translation so the summary cannot drift from the article. The validator rejects missing references, empty groups and duplicated entries. The reader renders all three groups after the article; the body-translation toggle leaves these review notes readable. Summary wording and accuracy still require editorial review.

All source content renders as text, never HTML. External source/license links must be HTTPS without embedded credentials. Article fetch paths derive only from validated catalog IDs, never arbitrary route strings.

## Daily editorial workflow

1. Acquire current main and check unpublished editions/PRs before choosing a story. Restrict retrieval to the separately approved fixed-source registry. Public readability or attribution alone is not permission to republish/translate.
2. Verify article-level reuse rights and third-party exceptions. No paywall, login, robots, or access-control bypass. Use text only unless images have a separately verified license.
3. Record source URL, original date, license evidence, attribution, retrieval date in the editorial review. Preserve a stable story ID; avoid re-publishing the same story as fresh news. A historic educational item must say so.
4. For each language, independently choose a native-language original from an authoritative source with confirmed reuse rights. Do not fill language slots by translating one source into all languages. Produce short level-appropriate educational adaptations, paired Chinese sentences, curated in-context glosses and the three-part learning summary. Independently check facts, numbers, names, translations, inflections, rights and level estimates. Never invent news to fill a day or level.
5. Add immutable article JSON and necessary index rows. Assemble deterministically with `node scripts/build_reading_index.js`. Run `node scripts/validate_reading.js`, `node tests/test-reading.js`, `npm test`, `git diff --check`. Inspect the rendered page, deep links, mobile layout and controls. Validator verifies structure, not truth or legal rights.
6. Refresh remote main, preserve concurrent work, and publish only within explicit authorization. Verify exact remote commit and deployment before claiming it is live. If no source qualifies, retain the last edition and report the gap instead of overwriting older content.

The UI does not itself crawl or schedule publication. A separately configured dot task prepares editions. Merging this module alone does not enable an automation.
