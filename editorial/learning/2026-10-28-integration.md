# OCR learning integration — 2026-10-28

This content batch was published and verified at commit `1644f11766c23ab4f7b6d2fe5df51f43172d0c16`; see the deployment receipt. It is **not completion of all 24 books**. The chapter ledger deliberately retains unfinished work. No OCR source text or private textbook excerpts are in this repository.

## Deliverables

- 9 new original-learning readings: 4 supported A2 and 5 concise B1, 188–209 source-language words each. Fiction/non-news labels and original authorship remain explicit.
- 32 article-dependent comprehension questions, solved independently without keys (27 initial + 13 revised/new blind items; the final French wording refinement was checked after key access).
- 45 exact-text recall questions with spelling and vocabulary-game integration through the existing module.
- 18 original applied grammar supplements in existing topics; Italian/German canonicalizers and the French builder preserve them.
- 21 existing vocabulary entries corrected/enriched (22 fields); no headword, ordering, level, legacy ID, mastery or SRS change.
- Existing 328 reading/practice/comprehension/listening files byte-preserved; grammar tree, aliases and prior body text preserved.

## Input and coverage

The restored archive contains 24 Markdown books and 3,842 page markers. `2026-10-28-coverage.json` holds 573 headings/container rows with source hashes, line/page ranges, output references and explicit states. Nested containers overlap: do not sum their page ranges or count mapped headings as completed chapters.

An existing German course already has 54 units and 2,107 selected vocabulary items; Italian grammar already has matching targets for 109 source subsection headings. Existing pronunciation and Loescher-topic matches are navigation-level reuse candidates. Mapping alone does not verify all body facts or resolve legacy provenance.

| Book | Page markers | Inventory rows | Current handling |
|---|---:|---:|---|
| 德语中高级词汇练习与解析 | 190 | 22 | 0 bounded fact rows; 0 existing target mappings; remainder pending |
| 走遍德国 中级1 学生用书 | 188 | 13 | 1 bounded fact rows; 11 existing target mappings; remainder pending |
| 走遍德国 中级2 学生用书 | 187 | 13 | 1 bounded fact rows; 11 existing target mappings; remainder pending |
| 走遍德国 初级1 学生用书 | 248 | 11 | 1 bounded fact rows; 9 existing target mappings; remainder pending |
| 走遍德国 初级2 学生用书 | 280 | 11 | 1 bounded fact rows; 9 existing target mappings; remainder pending |
| 走遍德国 初级3 学生用书 | 273 | 11 | 1 bounded fact rows; 9 existing target mappings; remainder pending |
| Dieci Racconti A1-A2（分级读物） | 34 | 14 | Proprietary narrative/transcript/exercise expression excluded; factual review still pending |
| La Partita A1-A2（分级读物） | 32 | 21 | Proprietary narrative/transcript/exercise expression excluded; factual review still pending |
| Lo Straniero B1-B2（分级读物） | 28 | 1 | Proprietary narrative/transcript/exercise expression excluded; factual review still pending |
| Loescher Archivio Grammatica（语法汇编） | 88 | 39 | All35 teaching rows body-reviewed:15 identified-objective coverage passes,20 open gaps; four answer containers remain pending |
| Nuovi Casi（分级读物） | 35 | 1 | Proprietary narrative/transcript/exercise expression excluded; factual review still pending |
| TRASCRIZIONE BRANI 2A 2B（听力原文） | 21 | 12 | Proprietary narrative/transcript/exercise expression excluded; factual review still pending |
| 意大利语动词搭配大全 | 428 | 4 | 2 bounded fact rows; 0 existing target mappings; remainder pending |
| 意大利语法 | 306 | 133 | 0 bounded fact rows; 109 existing target mappings; remainder pending |
| 意大利语语音入门 | 18 | 1 | 0 bounded fact rows; 1 existing target mappings; remainder pending |
| 意大利语语音快速突破 | 94 | 33 | 0 bounded fact rows; 32 existing target mappings; remainder pending |
| 新版新视线第二册练习手册 | 160 | 12 | 0 bounded fact rows; 0 existing target mappings; remainder pending |
| 新版第一册练习册答案 | 15 | 12 | Proprietary narrative/transcript/exercise expression excluded; factual review still pending |
| 新视线意大利语（修订版）A1-A2 | 256 | 20 | 2 bounded fact rows; 0 existing target mappings; remainder pending |
| 你好法语3 教师用书 B1 | 121 | 31 | OCR lesson boundaries unreliable; teacher/student overlap noted; no lesson completion claimed |
| 你好法语4 | 166 | 31 | 2 bounded fact rows; 0 existing target mappings; remainder pending |
| 你好！法语1 学生用书 A1 | 236 | 50 | 2 bounded fact rows; 0 existing target mappings; remainder pending |
| 你好！法语2 学生用书 A2 | 258 | 46 | 9 bounded fact rows; 0 existing target mappings; remainder pending |
| 你好！法语3 学生用书 | 180 | 31 | 2 bounded fact rows; 0 existing target mappings; remainder pending |

## Acceptance and limits

The review JSON records exact content hashes and resolved findings. Grammar explanations, translations and answers received an independent model review; this is not native-speaker certification. Most cloze distractors test form recognition; the task explicitly asks for the original wording, not unrestricted synonym generation. The B1 texts are deliberately short originals and are not presented as daily-news three-tier editions.

Full tests: **45 harnesses, 483,899 passed, 0 failed, 0 known issues**. All module, vocabulary, reading, practice, comprehension and source-candidate validators passed. Independent local UI checks passed for all9 readings on desktop/mobile, representative IT/FR/DE interaction flows, all18 supplement texts and all22 vocabulary fields. External fonts and the Markdown renderer were blocked by the local-only harness; normal external-asset rendering is not certified. The review JSON records this environment limitation and the denied attempt to remove the localhost restriction. Publication is verified separately against the resulting commit, remote deployment checks and production assets.

## Finite continuation batches

1. **Core course gaps:** inspect four consecutive unreviewed source lessons per language, compare learning objectives against mapped grammar/vocabulary, and record each outcome as an explicit existing-coverage merge or a reviewed original supplement. Do not repeat the October 26 starter or this batch.
2. **Intermediate usage:** process the remaining German B2/C1 and French B1 lesson groups four at a time; prioritize collocation, tense and clause distinctions and original B1/B2 reading. A chapter is complete only after all identified factual objectives have outputs or explained exclusions.
3. **Italian references:** reconcile each remaining Loescher topic and the verb dictionary in bounded alphabetical/grammar groups. Generic OCR headings require body identification before assigning a topic. Do not import dictionaries or exercises wholesale.
4. **Secondary inputs:** compare teacher/answer books against their student books to merge duplicates only after locating the actual sections. Reconstruct the French teacher book boundaries; its 30 headings currently cluster before the body.
5. **Pronunciation and readers:** retain the independently sourced pronunciation lessons; do not trust OCR IPA. Fictional readers and listening transcripts may inform generic learning goals only; plots, original sentences, translated pages and exercises remain excluded absent verified reuse rights.

No automation, unrelated issue plan, permissions, paid service or security setting was created or changed.

## Subsequent bounded coverage audit

After publication, all35 Loescher teaching sections were read and compared with actual website bodies, covering41 teaching pages and two brief factual notes on exercise pages. Of107 identified objectives,70 have existing coverage,17 partial coverage,15 encounter existing misleading wording, and5 lack an adequate explanation. This produces15 covered teaching rows and20 rows with open objectives; the four answer containers remain unreviewed. The audit records exact source ranges and existing-body hashes, plus at most8 priority follow-up groups.

Per the latest scope instruction, pre-existing page problems are reported only; no further runtime, grammar or vocabulary edits were made. Some old paragraphs contradict more precise new supplements; these are explicitly recorded in the objective audit. Whole-book completion remains0. The finite continuation queue is in `2026-10-28-next-batches.json`; its groups are work units, not scheduled automations or a promise of completion time.
