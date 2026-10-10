# Curated multilingual reading

## Public UI

The `#/it/reading` index (also `de`, `en`, `fr`) offers editorial CEFR filters. An article has a permanent `#/it/reading/article/<id>` link. Chinese translations can be hidden globally or per sentence. Marking an article read is local-only, reversible and included in the existing export/import/reset scope through `DimStorage.key(lang, 'reading_progress')`.

Each underlined word has a curated sentence-specific gloss. Selecting a word in the foreign text uses the same lookup; exact current-language vocabulary headwords are the fallback and are explicitly not context-disambiguated. Unknown inflections and arbitrary phrases do not receive fabricated translations. No translation API is called. `App.speak` uses the existing browser speech synthesis and the article language; device voices and pronunciation quality vary.

## Edition contract

`data/reading/index.json`: `{ "schema": 1, "articles": [...] }`. Each index row contains `id, lang, date, title, titleZh, summaryZh, level`, copied exactly from its article. Article files live at `data/reading/articles/<id>.json`; lowercase ASCII IDs are immutable.

Each article requires:
- `schema: 1`, stable `id`, cross-language `storyId`, `lang` (it/fr/de/en), edition `date` (YYYY-MM-DD)
- foreign `title`, `titleZh`, `summaryZh`, a single `level` (A1–C2), and `levelReason`. Levels are editor estimates, not certified CEFR assessments.
- `source: {name, title, url, publishedAt, lang}`: actual original publication date and language, separate from edition date
- `license: {name, url}`, `attribution`, `adaptation`: precise copyright basis and disclosure of translation/simplification
- `sentences: [{id, text, zh, glosses: [{surface, lemma, zh, note?}]}]`. `surface` must occur verbatim in that sentence. Prefer individual words for clickable annotations. A selected multiword surface may use a curated gloss, otherwise only sentence translation is offered.

All source content renders as text, never HTML. External source/license links must be HTTPS without embedded credentials. Article fetch paths derive only from validated catalog IDs, never arbitrary route strings.

## Daily editorial workflow

1. Acquire current main and check unpublished editions/PRs before choosing a story. Restrict retrieval to the separately approved fixed-source registry. Public readability or attribution alone is not permission to republish/translate.
2. Verify article-level reuse rights and third-party exceptions. No paywall, login, robots, or access-control bypass. Use text only unless images have a separately verified license.
3. Record source URL, original date, license evidence, attribution, retrieval date in the editorial review. Preserve a stable story ID; avoid re-publishing the same story as fresh news. A historic educational item must say so.
4. Produce short level-appropriate educational adaptations, paired Chinese sentences and curated in-context glosses. Independently check facts, numbers, names, translations, inflections, rights and level estimates. Never invent news to fill a day or level.
5. Add immutable article JSON and necessary index rows. Assemble deterministically with `node scripts/build_reading_index.js`. Run `node scripts/validate_reading.js`, `node tests/test-reading.js`, `npm test`, `git diff --check`. Inspect the rendered page, deep links, mobile layout and controls. Validator verifies structure, not truth or legal rights.
6. Refresh remote main, preserve concurrent work, and publish only within explicit authorization. Verify exact remote commit and deployment before claiming it is live. If no source qualifies, retain the last edition and report the gap instead of overwriting older content.

The UI does not itself crawl or schedule publication. A separately configured dot task prepares editions. Merging this module alone does not enable an automation.
