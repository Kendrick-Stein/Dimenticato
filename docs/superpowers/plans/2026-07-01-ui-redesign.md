# Dimenticato UI Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Reskin the existing Dimenticato static SPA (IT/DE/EN vocabulary app) to the approved warm-neutral + single-sage-accent design, consolidating the two-nav shell into one 250px sidebar + slim topbar, without changing any data, storage keys, routing, or feature behavior.

**Architecture:** The live app is already 100% CSS-token-driven and has a section-based nav system. We exploit both: (1) make the brief's tokens canonical and redefine the legacy token names as thin aliases, so re-valuing tokens reskins the entire app at once and flattens the banned gradients/glass; (2) re-point the existing `updateHeaderNavigation()` from the old `.top-nav-btn` to the new sidebar `.nav-item`, reusing the breadcrumb + stat-pill IDs untouched. Foundation (tokens + shell + full component CSS + JS re-wire) lands first as one coherent change; screen-by-screen polish then parallelizes across git worktrees.

**Tech stack:** Vanilla HTML/CSS/JS static site (no build step), deployed directly to GitHub. Google Fonts (Manrope, Noto Sans SC, Material Symbols Rounded). Chart.js for stats. Verification via headless Chrome screenshots (per project memory) + existing `tests/*.html` harnesses + a manual behavior checklist.

**Source of truth for exact CSS/markup:** the approved mockup `Dimenticato.dc.html` at repo root. Where a task says "port component X from the mockup," copy the verbatim CSS/markup from that file — it is the design spec in code form.

---

## Non-negotiable invariants (apply to EVERY task)

- Do **not** change any `localStorage` key, `Storage.KEYS.*`, import/export JSON shape, `AppState` fields, screen IDs, element IDs consumed by JS (`#totalWords`, `#mcOptions`, `#spInput`, `#breadcrumb`, `#wordList`, etc.), or event-handler wiring.
- Do **not** remove or rename any `.screen` section id (34 of them) or the `showScreen()` / `goBack()` contract.
- The ONLY chromatic color is `--accent`; `--bad` only for errors/destructive. No new hues, no gradients, no emoji. Icons come only from Material Symbols Rounded.
- `data-theme` stays on `<body>` (not `<html>`) and persists in the existing key `dimenticato_theme`. Language stays in `Storage.KEYS.LANGUAGE`.
- After each task: run the two test harnesses and confirm no fatal JS error on boot (headless screenshot is non-blank).

**Verification primitives (referenced by tasks):**

- `SERVE`: `python3 -m http.server 8799` from repo root (run in background).
- `SHOT <name> <url-query>`: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --window-size=1440,980 --virtual-time-budget=9000 --screenshot=/tmp/rd_<name>.png "http://localhost:8799/index.html"` — then Read the PNG. To reach a deep screen/theme, seed a tiny harness file (see project memory `dimenticato-headless-render-screenshots`) or click via a temporary `?` boot hook; delete after.
- `HARNESS`: open `tests/test-quiz-engine.html` and `tests/test-spaced-repetition.html` headlessly (or via the Node vm+DOM shim in memory `dimenticato-test-harnesses-node-shim`) and confirm pass counts unchanged.
- `BEHAVIOR`: manual checklist in Task F6.

---

## File map

| File | Responsibility | Phase 1 change | Phase 2 owner |
|------|----------------|----------------|---------------|
| `index.html` | Shell markup + 34 screen sections | Replace shell (header+aside → sidebar+topbar); add font/Material-Symbols links; keep all screen sections | Reclass screen-section markup per stream |
| `styles.css` | Token system + all component CSS | Re-value tokens as brief-canonical + legacy aliases; flatten surfaces; neutralize per-language themes; **port full mockup component library** | Minimal/none (library already complete) |
| `app.js` | IT logic, nav, theme, stats, language, dynamic emission | Re-wire `updateHeaderNavigation`, theme toggle, language pills | Update dynamic emitters (browse rows, MC options via QuizEngine, wordbook cards) |
| `lib/navigation.js` | Screen switch/history | None (contract preserved) | None |
| `lib/quiz-engine.js` | MC/spelling option markup | Check emitted classes | Align option classes to `.option`/states |
| `german-app.js` / (english handled here too) | DE/EN mirror logic + dynamic emission | None | Reclass DE/EN emitted markup |
| `conjugation-app.js` | Conjugation setup/practice/results | None | Tense chips, conj rows, tip strip, results |
| `grammar-book.js` | Chapter tree + reader | None | Two-pane, chapter list, reader typography |
| `verb-collocations.js` / `verb-collocations-practice.js` | Collocations book + practice | None | Same card/list system |
| `stats-charts.js` | Chart.js progress charts | None | Recolor to tokens; bar chart latest-day accent |
| `community-wordbooks.js` | Community browse + cards | None | Card/list reskin |

---

## PHASE 1 — Foundation (sequential, single branch `redesign/foundation`; do NOT parallelize)

### Task 1: Load fonts + Material Symbols, add `.msr` helper

**Files:** Modify `index.html:3-8` (head); Modify `styles.css` (top, after comment block).

- [x] **Step 1 — Add font links in `<head>`** (after the `<title>`, before `styles.css` link):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400,0,0&display=swap" rel="stylesheet">
```

- [x] **Step 2 — Add `.msr` helper + base font stack** to `styles.css` (copy the `.msr` rule and `body` font-family/`-webkit-font-smoothing` from the mockup's `<style>`). Set `body{font-family:'Manrope','Noto Sans SC',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}` — merge into existing `body` rule, do not duplicate.
- [x] **Step 3 — Verify:** `SERVE`; `SHOT boot ""`; confirm text renders in Manrope and page is non-blank. Commit: `style: load Manrope/Noto SC/Material Symbols + .msr helper`.

### Task 2: Re-value tokens (brief-canonical + legacy aliases), flatten surfaces, drop per-language themes

**Files:** Modify `styles.css:10-140` (the `:root` / `[data-theme="dark"]` blocks) and the `[data-language="german"]` / `[data-language="english"]` blocks (locate via `grep -n 'data-language' styles.css`).

- [x] **Step 1 — Add brief tokens as canonical** at the top of `:root` (verbatim from the brief/mockup):

```css
:root{
  --bg:#f3f1ea; --surface:#faf8f3; --card:#ffffff; --card-2:#f2efe7;
  --border:#e6e2d8; --border-strong:#d5d0c3;
  --ink:#211f1b; --ink-2:#544f46; --muted:#8f8a7d;
  --accent:#4a7a5e; --accent-soft:#e7efe9;
  --good:#4a7a5e; --good-soft:#e7efe9;
  --bad:#b0564b; --bad-soft:#f6e8e5;
}
```

- [x] **Step 2 — Redefine legacy names as aliases** (so the whole legacy stylesheet adopts the new palette and loses gradients/glass). Replace the legacy values:

```css
:root{
  --accent-primary:var(--accent); --accent-primary-rgb:74,122,94;
  --accent-secondary:var(--accent); --accent-secondary-rgb:74,122,94;
  --accent-danger:var(--bad); --accent-danger-rgb:176,86,75;
  --accent-color:var(--accent);
  --bg-primary:var(--bg); --bg-secondary:var(--surface);
  --bg-card:var(--card);                 /* was rgba glass → now solid */
  --surface-strong:var(--card); --surface-raised:var(--card);  /* kill gradient */
  --surface-input:var(--card); --surface-glass:var(--surface);
  --surface-popover:var(--surface);
  --text-primary:var(--ink); --text-secondary:var(--ink-2); --text-muted:var(--muted);
  --text-on-accent:#ffffff;
  --border-color:var(--border); --border-strong:var(--border-strong);
  --accent-soft:var(--accent-soft); --success-soft:var(--good-soft);
  --danger-soft:var(--bad-soft);
  --bg-glow:transparent;                 /* remove per-language glow */
  --shadow-sm:0 1px 2px rgba(0,0,0,.03);
  --shadow:0 1px 2px rgba(0,0,0,.03);
  --shadow-lg:0 14px 30px -18px rgba(0,0,0,.2);
}
```
(Keep the existing radii/space/motion scale — those are fine. Where a legacy `rgba(var(--accent-*-rgb), a)` is used, it now resolves to the sage/bad rgb above.)

- [x] **Step 3 — Dark theme:** in `[data-theme="dark"]`, set the brief dark tokens verbatim, and point the same legacy aliases at them (mirror Step 2 with dark rgb: `--accent-primary-rgb:131,177,145; --accent-danger-rgb:215,141,130;`). Flatten `--surface-raised`/`--bg-card` to solid `var(--card)`.
- [x] **Step 4 — Neutralize per-language color themes:** in the `[data-language="german"]` and `[data-language="english"]` blocks, remove the accent/surface overrides (or set them to `var(--accent)` etc.) so all three languages render the single sage accent. Keep the `data-language` attribute mechanism itself (other logic may read it).
- [x] **Step 5 — Verify:** `SHOT tokens-light ""` and a dark + a german screenshot; confirm one sage accent everywhere, flat surfaces, no gradient/glass, no per-language hue. `HARNESS`. Commit: `style(tokens): brief palette canonical + legacy aliases, flatten surfaces, drop per-language hues`.

### Task 3: Replace shell markup (header + aside → sidebar + topbar)

**Files:** Modify `index.html:54-78` (delete `<header class="header">…`), `index.html` `<aside class="sidebar">…</aside>` block (`~1436-1492`, delete), insert new shell.

- [x] **Step 1 — Insert the new sidebar + topbar markup** at the top of `#app`, ported from the mockup's `<aside class="sidebar">` and `.topbar`, adapted so:
  - Brand button → `onclick`/handler navigates to the language portal (reuse existing portal entry; if none, navigate to `welcomeScreen`).
  - Language pills carry `data-language="italian|german|english"` (match `LanguagePortal.selectLanguage` arg values) and get an `active` class.
  - Menu nav items carry `data-section="home|vocab|grammar|progress|settings"` and `data-target` = the corresponding screen id (`welcomeScreen`/`vocabularyScreen`/`grammarScreen`/`progressScreen`/`settingsScreen`) so existing click→`showScreen` wiring works.
  - Footer: theme toggle keeps `id="themeBtn"`; help keeps `id="helpBtn"`.
  - Topbar keeps `id="breadcrumb"` and three stat pills containing `id="totalWords"`, `id="masteredWords"`, `id="progressPercent"` (do not rename).
  - Add hamburger button (`.hamburger`, shows < 820px) + `.scrim` for the drawer.
- [x] **Step 2 — Preserve moved controls:** the old aside had `exportDataBtn / importDataBtn / resetBtn / statsBtn / languageSwitchBtn(+popover)`. These are also reachable from the Settings screen; confirm those Settings buttons exist and are wired (they do: `settingsExportBtn`, etc.). If any handler was bound ONLY to the aside id, re-bind it to the Settings equivalent or keep a hidden element to avoid a null-ref. Grep each removed id before deleting: `grep -n "getElementById('exportDataBtn')" app.js *.js`.
- [x] **Step 3 — Verify:** `SHOT shell ""`; sidebar shows text labels + Material Symbols, topbar shows breadcrumb + 3 pills. No console error (check `SERVE` log / add temporary `window.onerror`). Commit: `feat(shell): consolidate header+aside into sidebar+topbar`.

### Task 4: Port the full mockup component CSS into `styles.css`

**Files:** Modify `styles.css` (append a new clearly-commented section `/* ===== REDESIGN COMPONENT LIBRARY (from Dimenticato.dc.html) ===== */`).

- [x] **Step 1 — Copy the mockup's component CSS verbatim** for: `.shell/.sidebar/.brand/.lang-pills/.nav/.side-footer`, `.topbar/.breadcrumb/.stat-pill`, `.content/.container`, `.eyebrow/.page/.desc/.back-link`, `.card-grid/.card/.card-chip`, `.portal/.lang-card/.progress-track`, `.practice-head/.session-bar/.practice-card/.word/.speaker/.options/.option(+states)/.primary-btn`, `.spell-input/.pill-btn/.feedback`, `.browse-controls/.search-*/.chip/.word-card/.word-line`, `.conj-*`/`.tip-strip`, `.book-layout/.book-nav/.chapter-btn/.book-reader`, `.big-stat/.panel/.bar-chart/.acc-*`, `.settings-card/.data-row/.pref-row/.seg/.stepper`, and the `@media (max-width:820px)` drawer block. These use the brief token names added in Task 2, so they drop in unchanged.
- [x] **Step 2 — Guard against legacy collisions:** the mockup reuses generic names (`.card`, `.chip`, `.panel`, `.option`, `.search-input`). Grep each for existing definitions (`grep -n '\.card{' styles.css`). Where a legacy rule with the same selector exists and differs, prefer the redesign rule (place the library section AFTER legacy so it wins) OR namespace the legacy one. Document any collision resolved.
- [x] **Step 3 — Verify:** `SHOT` the hub + one card screen; cards show 16px radius, chip, hover lift. Commit: `style: import redesign component library`.

### Task 5: Re-wire JS (nav-active, theme toggle, language pills)

**Files:** Modify `app.js:795-809` (`updateHeaderNavigation`), theme toggle handler (`app.js:2170` + `:308`), language pill binding (new), `LanguagePortal` (`app.js:2403-2447`).

- [x] **Step 1 — Nav active by section:** in `updateHeaderNavigation`, replace the `.top-nav-btn` loop with:

```js
const SECTION_BY_TOPNAV = {
  welcomeScreen:'home', vocabularyScreen:'vocab',
  grammarScreen:'grammar', progressScreen:'progress', settingsScreen:'settings'
};
const section = SECTION_BY_TOPNAV[meta.topNav] || 'home';
document.querySelectorAll('.nav-item[data-section]').forEach(btn => {
  btn.classList.toggle('active', btn.dataset.section === section);
});
```
Keep the breadcrumb block as-is (it already writes `#breadcrumb`). Style `.breadcrumb-item`/`.breadcrumb-separator` in the library to match the mockup's `--muted`/`b` treatment.

- [x] **Step 2 — Theme toggle icon/label:** ensure `#themeBtn` toggles `data-theme` on `body` (existing) and swaps the Material Symbol (`dark_mode`↔`light_mode`) + label (`深色模式`↔`浅色模式`). Reuse existing `toggleTheme` at `app.js:308`; add the icon/label swap.
- [x] **Step 3 — Language pills:** bind `.lang-pill[data-language]` clicks → `LanguagePortal.selectLanguage(lang)`. In `selectLanguage` (and `init`), sync `.lang-pill.active` (currently it syncs `.language-switcher-option`). Because Task 2 neutralized per-language CSS, the `body[data-language]` set here no longer changes hue — that is intended.
- [x] **Step 4 — Verify:** click each nav item → correct sidebar highlight + breadcrumb; toggle theme (persists across reload); switch IT/DE/EN → lands on that language's home, pill active, accent stays sage, stat pills update. `HARNESS`. Commit: `feat(nav): drive sidebar nav/theme/language from existing header system`.

### Task 6: Foundation acceptance gate

- [x] Run `HARNESS` (both) — pass counts unchanged.
- [x] `SHOT` hub + MC + spelling + browse + progress + settings + conjugation + grammar-book, light AND dark, and one DE + one EN — compare against `/tmp/dc_*.png` mockup renders; note any screen whose internals still look legacy (expected — Phase 2 polishes those).
- [x] `BEHAVIOR` smoke: theme persists; language persists; export → import round-trips; reset asks confirm; a full MC round + a spelling round record stats and update the topbar pills live.
- [x] Merge `redesign/foundation` → `redesign/ui` base branch. **Phase 2 worktrees branch from `redesign/ui`.**

---

## PHASE 2 — Screen polish (parallel worktrees off `redesign/ui`, one subagent each)

Each stream owns disjoint `index.html` sections + its own JS module(s) + (ideally zero) CSS. The component library from Task 4 already covers every pattern, so streams should add **little or no** `styles.css` — reclass markup and align JS-emitted class names to the library. Any unavoidable CSS goes in a clearly-fenced per-stream block to minimize merge conflict; the integrator resolves the `styles.css` append region.

Each stream's Definition of Done: its screens visually match the corresponding mockup screen in light + dark; all IDs/handlers/keys unchanged; `HARNESS` green; screenshots attached in the PR/worktree note.

### Stream A — Portal + language homes
- Files: `index.html` (`welcomeScreen`, `germanWelcomeScreen`, `englishWelcomeScreen`, portal if separate), possibly `app.js`/`german-app.js` home render.
- Work: build/confirm the **language portal** (3 language cards + progress bars) and the **2×2 home grid** using `.card`; eyebrow per language (ITALIAN/GERMAN/ENGLISH); remove the old "card-inside-big-panel" wrapper. Wire the language-card progress % to real stats if available, else the existing value.

### Stream B — Vocabulary flow (source + levels + wordbooks + modes)
- Files: `index.html` (`vocabularyScreen`+DE/EN, `vocabularyModesScreen`+DE/EN), `app.js`/`german-app.js` wordbook-card emission, `community-wordbooks.js` entry card.
- Work: source screen top-level as 3 `.card`s (System/My/Community) with the level tiers (初级/中级/高级/全部) + Cognates + wordbook cards + community styled as the same card/pill system one level deeper (see brief §3.3 note). Practice-mode screen as 3 `.card`s (选择题/拼写/浏览).

### Stream C — Practice (Multiple Choice + Spelling), all languages
- Files: `index.html` (`multipleChoiceScreen`, `spellingScreen`, + DE/EN mirrors), `lib/quiz-engine.js` (option markup), `app.js` MC/spelling glue.
- Work: practice-card frame (`.practice-head`, `.session-bar`, radius-20 card, 40px word, `.speaker`, 显示中文提示, `.field-label`); options as `.option` with `.correct/.wrong/.faded` states and full-width `.primary-btn` 下一个; spelling input `.good/.bad`, `听发音` pill, `check_circle/cancel` feedback, Enter-to-check. Keep QuizEngine logic; only align emitted class names.

### Stream D — Browse, all languages
- Files: `index.html` (`browseScreen`+DE/EN), `app.js`/`german-app.js` word-row emission.
- Work: search input with leading `search` icon + 3 filter chips (全部/已掌握/学习中) + single `.word-card` of `.word-line` rows (word/gloss/cn/status-dot/speaker), row hover. Reclass the dynamic row generator; preserve search/filter/add-to-wordbook behavior.

### Stream E — Grammar + Conjugation + Grammar Book + Verb collocations
- Files: `index.html` (`grammarScreen`+DE/EN, `conjugationSetupScreen`, `conjugationScreen`, `grammarBookScreen`, `verbCollocationsScreen`, `verbCollocationPracticeScreen`), `conjugation-app.js`, `grammar-book.js`, `verb-collocations*.js`.
- Work: grammar topic cards; conjugation header (verb + `· to speak`) + tense chips + `.conj-card` person→form rows + `.tip-strip`; keep the vari, lookup query feature (style inputs/buttons with tokens); grammar-book two-pane (sticky `.book-nav` chapter list + `.book-reader` typography); collocations reuse the same list/card system.

### Stream F — Progress + Stats charts + Settings + Community + modals
- Files: `index.html` (`progressScreen`+DE/EN, `settingsScreen`+DE/EN, `communityBrowseScreen`, stats/editor modals), `stats-charts.js`, `community-wordbooks.js`.
- Work: progress 3 big stat cards + `.bar-chart` (latest day accent) + accuracy panel with `.acc-*` bars (recolor Chart.js to tokens); settings `.settings-card` with `.data-row`(+`chevron_right`, danger row), `.pref-row` segmented 简单/困难 + word-count `.stepper`, about card; community cards + modals reskinned to `.card`/`.settings-card`.

---

## Integration & final acceptance

- [ ] Merge streams A–F into `redesign/ui` in order, resolving the `styles.css` append region and any shared `app.js` emitter once.
- [ ] Full `HARNESS` green; `SHOT` every screen light+dark IT/DE/EN vs mockup.
- [ ] `BEHAVIOR` full pass — the §5 acceptance checklist from the brief:
  - every feature/data source/localStorage key/import-export path works;
  - theme flips `data-theme` + persists; both palettes correct everywhere;
  - sidebar nav shows labels + highlights by active section;
  - top stat pills update live during practice;
  - MC + spelling show `--good`/`--bad` states;
  - no new colors/gradients/emoji.
- [ ] Delete `Dimenticato.dc.html` (or move to `docs/`) once parity confirmed — decide with user.
- [ ] Merge `redesign/ui` → `main`.

---

## Self-review notes
- **Spec coverage:** brief §1 (design system)→Tasks 1-2,4; §2 (shell)→Task 3,5; §3 screens 1-12→Streams A-F; §4 responsive→Task 4 drawer + per-stream single-column; §5 checklist→Integration gate. No gaps.
- **Risk register:** (1) generic class-name collisions (`.card/.panel/.chip/.option/.search-input`) between mockup lib and legacy — mitigated by Task 4 Step 2 ordering/namespacing. (2) Removed-aside handlers bound by id — mitigated Task 3 Step 2 grep-before-delete. (3) QuizEngine option markup owns its classes — Stream C aligns them in `lib/quiz-engine.js`, shared with DE/EN so do it once. (4) Chart.js colors are JS-set, not CSS — Stream F reads tokens via `getComputedStyle`.
