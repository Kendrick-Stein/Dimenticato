# Curated multilingual reading

## Public UI

The `#/it/reading` index (also `de`, `en`, `fr`) offers theme and editorial CEFR filters, combined with the current language. Filters survive language switches during the session and can be cleared together. All seven themes stay visible even if no article is published in one; an empty state never invents content. An article has a permanent `#/it/reading/article/<id>` link. One top-level control shows or hides all body translations. Sentence audio is opt-in through the top-level “逐句朗读” toggle; the default reading flow contains no repeated sentence toolbar. Both controls expose their state with `aria-pressed`, and individual audio buttons have sentence-number labels. Marking an article read is local-only, reversible and included in the existing export/import/reset scope through `DimStorage.key(lang, 'reading_progress')`.

Each underlined word has a curated sentence-specific gloss. Selecting a word in the foreign text uses the same lookup; exact current-language vocabulary headwords are the fallback and are explicitly not context-disambiguated. Unknown inflections and arbitrary phrases do not receive fabricated translations. No translation API is called. `App.speak` uses the existing browser speech synthesis and the article language; device voices and pronunciation quality vary.

## Edition contract

`data/reading/index.json`: `{ "schema": 1, "articles": [...] }`. Each index row contains `id, lang, date, title, titleZh, summaryZh, level, category, topics`, copied exactly from its article, plus `sourceLang` / `sourcePublishedAt` copied from `source.lang` / `source.publishedAt` and optional `contentType`. Cards show original publication and edition dates separately. Native-source adaptations sort ahead of any legacy editions; within each group the original source date sorts newest-first, then the edition date. Month-only historical dates keep their actual precision. Collection/edition dates never substitute for original publication dates. Article files live at `data/reading/articles/<id>.json`; lowercase ASCII IDs are immutable.

Each article requires:
- `schema: 1`, stable `id`, cross-language `storyId`, `lang` (it/fr/de/en), edition `date` (YYYY-MM-DD)
- one `category` (`technology`, `society`, `culture`, `environment`, `education`, `work-economy`, `health`) and 1–5 unique `topics` labels (up to 40 characters each). The shared taxonomy and sorting live in `lib/reading-catalog.js`.
- foreign `title`, `titleZh`, `summaryZh`, a single `level` (A1–C2), and `levelReason`. Levels are editor estimates, not certified CEFR assessments.
- `source: {name, title, url, publishedAt, lang}`: actual original publication date and language, separate from edition date
- `license: {name, url}`, `attribution`, `adaptation`: precise copyright basis and disclosure of translation/simplification
- `sentences: [{id, text, zh, glosses: [{surface, lemma, zh, note?}]}]`. `surface` must occur verbatim in that sentence. Prefer individual words for clickable annotations. A selected multiword surface may use a curated gloss, otherwise only sentence translation is offered.

New editions use `contentType: "native-adaptation"` only when the editorial review verifies a institutional original in the article language and `source.lang === lang`. The UI says “原语机构来源 · 同语言改写”, without asserting a publisher-certified drafting language. This is an editorial claim, not something language-code equality alone proves. Such editions require a learning summary. Legacy-compatible article data may omit both fields; cross-language adaptations are labeled explicitly and missing summaries are disclosed rather than generated from guesses.

`learningSummary` has three nonempty groups:
- `words: [{text, zh, sentenceId, lemma?, note?}]` for essential words
- `phrases: [{text, zh, sentenceId, lemma?, note?}]` for useful phrases
- `sentences: [{sentenceId, note}]` for memorable sentences and a concrete learning point

Each word/phrase `text` must occur verbatim in the referenced sentence. Sentence quotations reuse that sentence's foreign text and Chinese translation so the summary cannot drift from the article. The validator rejects missing references, empty groups and duplicated entries. The reader renders all three groups after the article; the body-translation toggle leaves these review notes readable. Summary wording and accuracy still require editorial review.

`speaking` is optional and never generated for old articles from generic filler. When editorially reviewed, it contains 1–3 paired `{text, zh}` discussion `questions` tied to the article, and optionally 1–5 paired `expressions` with `note`. An expression may cite `sentenceId`, in which case its text must occur verbatim in that sentence. The reader shows this after the learning summary only when it exists. The same factual/language review applies; do not turn educational health news into personal medical advice.

The four shared-source language-day editions (`2026-10-10-{it,fr,de,en}-languages`, story `ec-languages-2026-09-26`) were withdrawn at the user's request. Their files and catalog rows are removed, so old deep links show “not found.” No progress keys or local personal learning records were erased. Git history retains recoverable copies; do not restore or republish them as daily material.

All source content renders as text, never HTML. External source/license links must be HTTPS without embedded credentials. Article fetch paths derive only from validated catalog IDs, never arbitrary route strings.

## Source reserve and review boundary

- `data/reading/sources.json` is the discovery registry, with institution/language restrictions, safe URL prefixes, rights-policy links and mandatory article-level review. Registration is never blanket permission. Broad sites such as GOV.UK additionally require the article's named publisher to match the registered institution.
- `editorial/reading/candidates.json` stores source metadata and evidence only, under `schemaVersion: 1`. It does not contain adapted article text, sentence translations or a public index row. `docs/reading-candidates.schema.json` and `docs/reading-sources.schema.json` document the contracts; `scripts/validate_reading_candidates.js` enforces cross-field dates, rights evidence, language/source matches, duplicates and publication separation.
- Intake `status` is `collected`, `verified`, or `rejected`. `verified` means the original full text, date, language provenance and precise adaptation/republication rights have been checked. It does not mean a learning edition has been written or approved. A `rights_verified` workflow stage is the source-research boundary. Later `editorial_review`/`ready` stages still describe internal work; every candidate must keep `readyForPublication: false`. No `published` status/stage is allowed. A final approved edition is a separate article file; `linkToArticleId` can then record that exact published source/language match.
- The catalog generator reads only `data/reading/articles/`; the public reader loads only the catalog and validated catalog IDs. Neither reads the reserve or promotes candidates. Use the normal human/editorial review and authorized Git publication workflow to create an edition. Do not paste confidential data, credentials, paywalled full text, or unapproved third-party media into this public repository; the reserve is not private storage.
- Prefer original publication within 30 days, then within 90 days. Store `verification.freshness.asOf` explicitly; its snapshot is recalculated at the next collection/review, never treated as permanently current. Older evergreen material belongs in a clearly labeled historical reserve and must not fill current-news slots. Recheck current facts and article rights at conversion time. The excluded-source log records why attractive recent items failed, so they are not silently recycled.
- Prepare roughly a week's reserve where suitable sources exist, without quotas or cross-language filler. Categories and an article-specific speaking angle make the reserve reusable; they are editorial planning notes, not ready-made questions presented as reviewed content.

## Daily editorial workflow

1. Acquire current main and check published articles, the reserve, and unpublished editions/PRs before choosing a story. Collect and verify candidates before conversion; prioritize the recent, independent original-language reserve. Restrict retrieval to the separately approved fixed-source registry. Public readability or attribution alone is not permission to republish/translate.
2. Verify article-level reuse rights and third-party exceptions. No paywall, login, robots, or access-control bypass. Use text only unless images have a separately verified license.
3. Record source URL, original date, license evidence, attribution, retrieval date in the editorial review. Preserve a stable story ID; avoid re-publishing the same story as fresh news. A historic educational item must say so.
4. For each language, independently choose a native-language original from an authoritative source with confirmed reuse rights. Do not fill language slots by translating one source into all languages. Produce short level-appropriate educational adaptations, paired Chinese sentences, curated in-context glosses and the three-part learning summary. Independently check facts, numbers, names, translations, inflections, rights and level estimates. Never invent news to fill a day or level.
5. Add immutable article JSON and necessary index rows. Assemble deterministically with `node scripts/build_reading_index.js`. Run `node scripts/validate_reading_candidates.js`, `node scripts/validate_reading.js`, `node tests/test-reading.js`, `npm test`, `git diff --check`. Inspect the rendered page, deep links, mobile layout and controls. Validator verifies structure, not truth or legal rights.
6. Refresh remote main, preserve concurrent work, and publish only within explicit authorization. Verify exact remote commit and deployment before claiming it is live. If no source qualifies, retain the last edition and report the gap instead of overwriting older content.

The UI does not itself crawl or schedule publication. A separately configured dot task prepares editions. Merging this module alone does not enable an automation.
