# Confusable Distractors for Vocabulary Quizzes — Design Spec

> Date: 2026-06-25
> Status: Approved (pending implementation plan)
> Related: `todo.txt` ("提高难度 / 选择单词意思选择相似的单词 / 或者是 显示 汉语")

## 1. Problem

In multiple-choice mode the 3 wrong options are chosen **purely at random**
(`lib/quiz-engine.js → generateOptions()` shuffles the whole word pool and takes
the first 3). Because random words rarely resemble the answer, questions are
often trivially easy — the learner can eliminate distractors on sight without
actually knowing the word. `todo.txt` asks for harder quizzes via distractors
that are *similar to* the answer.

## 2. Goal

Make multiple-choice distractors **orthographically confusable** with the prompt
word (e.g. prompt *casa* → *cassa, caso, cosa* instead of 3 random words),
behind a user-facing difficulty setting. Deliver the visible "harder" win with
**no new data files and no data-cleaning dependency**, so it ships on the
existing static GitHub Pages deployment.

### Success criteria
- In 困难 (hard) mode, distractors are measurably closer (lower average edit
  distance to the prompt's source form) than random selection.
- 简单 (easy) mode reproduces today's exact random behavior.
- Every question still renders exactly 4 distinct options, including for tiny
  custom wordbooks and 1–2 character prompt words.
- Works for Italian, German, and English with no per-language code duplication.
- Spelling and browse modes are unchanged.

## 3. Scope

### In scope
- Confusable distractor selection for **multiple-choice** mode, all 3 languages.
- A **difficulty setting** (`简单 random` / `困难 confusable`), persisted in
  `localStorage`, default **困难**.
- A new isolated, unit-tested similarity module.
- A new "学习偏好 / Learning preferences" group in the Settings screen.

### Out of scope (explicitly not doing now)
- Part-of-speech-aware distractors (Approach 2) — deferred; depends on cleaning
  the messy `dictionary` field, tracked as separate data-accuracy work.
- Precomputed confusion-set data files (Approach 3) — rejected: adds payload to
  an already heavy 6 MB inline vocabulary and a build script to maintain.
- Reverse-direction (meaning → recall word) quiz mode.
- Changes to spelling or browse modes.

### Chosen approach
**Approach 1 — runtime orthographic similarity.** Score candidate words by edit
distance of their *source form* to the prompt's source form, within the current
study pool, with light randomization. No data cleaning, no payload, single
shared code path. The design leaves room to layer POS signals later without
restructuring.

## 4. Architecture

### New module: `lib/word-similarity.js` (pure, no DOM)
Loaded before `lib/quiz-engine.js` (same pattern as `lib/utils.js`).

```
editDistance(a, b) -> number
    Levenshtein distance between two strings (lowercased, accent-normalized
    via the same NFD strip QuizEngine.normalizeString already uses).

pickConfusableDistractors(currentWord, pool, opts) -> Array<word>
    opts = { count, sourceField, targetField, correctTarget }
    Returns up to `count` distractor WORD objects whose source form is most
    similar to currentWord[sourceField], excluding the current word and any
    word whose targetField text equals correctTarget or an already-picked
    distractor's target.
```

Selection algorithm inside `pickConfusableDistractors`:
1. Build candidates = pool minus the current word, minus words whose
   `targetField` equals `correctTarget`.
2. If `currentWord[sourceField]` length ≤ 2 → rank candidates by **frequency
   proximity** (closeness of `rank`) instead of edit distance (edit distance is
   meaningless for 1–2 char words like *e*, *di*).
   Otherwise → rank by `editDistance(candidate.source, prompt.source)` ascending.
3. Take the closest window (default 8), shuffle it, pick `count`, deduping
   target text as we go.
4. If fewer than `count` candidates survive, fill the remainder from a random
   shuffle of the remaining pool. Never return fewer than available.

### Integration: `lib/quiz-engine.js`
`generateOptions(correctAnswer, wordPool)` reads a new `config.difficulty`
value:
- `'hard'` → distractor words come from `pickConfusableDistractors(...)`, then
  map to their `targetField` text.
- `'easy'` → existing random path, unchanged.

This is the single function all multiple-choice flows already share
(Italian via `app.js`, German/English via `german-app.js`), so no per-language
branching is added.

## 5. Data flow

```
Settings toggle
  → localStorage['dimenticato_quiz_difficulty']  ('easy' | 'hard')
  → AppState.quizDifficulty (loaded at startup, same place as selectedLevel)
  → QuizEngine config.difficulty
  → generateOptions()
  → pickConfusableDistractors()  (hard only)
  → renderOptions()
```

No vocabulary data files are read or modified. No network calls.

## 6. Edge cases

| Case | Handling |
|------|----------|
| 1–2 char prompt (`e`, `di`, `ho`) | Rank by frequency proximity, not edit distance |
| Custom wordbook with < 4 words | Existing `min(3, available)` guard; never crash |
| Sparse similar candidates | Fill remainder from random pool to reach 4 options |
| Duplicate meanings in pool | Dedupe distractor target text vs. correct + each other |
| Missing/empty source or target field | Skip that candidate; falls through to random fill |

## 7. Settings UI

Add a **"学习偏好 / Learning preferences"** card group to `#settingsScreen`
(currently only export/import/theme/help/publish/reset — no learning prefs).
Contains a difficulty selector:

- `简单` — random distractors (today's behavior)
- `困难` — confusable distractors (default)

Selecting an option writes to `localStorage` and updates `AppState.quizDifficulty`
immediately. Because the engine config is built when a quiz session starts, the
change takes effect on the **next quiz session** — no page reload required.

## 8. Testing

Extend the existing browser harness `tests/test-quiz-engine.html` (currently 19
cases) with unit tests for `lib/word-similarity.js`:
- `editDistance` correctness on known pairs.
- Closer words rank ahead of distant ones.
- Short-word (≤ 2 char) prompts use frequency proximity.
- Target-text dedupe (no duplicate options, no option == correct answer).
- `easy` mode still yields random selection (behavior preserved).
- Insufficient-candidate pools still fill to 4 options.

All assertions target pure functions; no new DOM harness needed.

## 9. Optional Phase 2 (cuttable, not blocking): Chinese answers for Italian

Italian multiple-choice currently tests **→ English** ("选择正确的英语翻译"),
while German/English already test **→ 中文** ("选择正确的中文释义"). `todo.txt`
also notes "显示汉语". Add an **answer-language toggle** for Italian
(English / 中文) that flips `fieldMap.target` between `english` and `chinese`
(the `chinese` field already exists in `vocabulary.js`).

- Default stays **English**, preserving the app's "learn Italian via English"
  intent (cognate module, etc.).
- Cost: a few labels in `index.html` + one config value + a Settings toggle.
- Independent of the distractor work; can ship separately or be dropped.

## 10. Files touched

| File | Change |
|------|--------|
| `lib/word-similarity.js` | **New** — similarity + distractor selection |
| `lib/quiz-engine.js` | `generateOptions` honors `config.difficulty` |
| `app.js` | Load `quizDifficulty` from localStorage; pass into engine config |
| `german-app.js` | Pass `quizDifficulty` into engine config |
| `index.html` | Load new script; add Learning-preferences settings group |
| `styles.css` | Styling for the new settings group (reuse existing card styles) |
| `tests/test-quiz-engine.html` | Add `word-similarity` unit tests |
| `CODE_SPACE.md` | Update module map + change log per project convention |
