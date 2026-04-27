# System Patterns

## Architecture Overview
Dimenticato is a static web application built around a single HTML shell (`index.html`) with multiple screen sections and a collection of modular JavaScript files. It follows a screen-switching SPA-like pattern without a frontend framework.

## Core Architectural Patterns

### 1. Single-Page, Screen-Based UI
- `index.html` contains many `<section class="screen">` views
- Navigation is controlled by `showScreen()` and related history/fallback helpers in `app.js`
- Fixed DOM IDs are a critical dependency across modules

### 2. Central State + Module Extensions
- `app.js` owns the primary global state (`AppState`) and shared storage/navigation logic
- Feature modules extend the app around this core
- `app-enhanced.js` monkey-patches or overrides some behavior from `app.js`

### 3. Data Precompiled Into JS Constants
- Large content/data assets are compiled into JS files under `data/`
- This avoids runtime fetch issues, especially for static hosting and non-ASCII paths
- Grammar books and vocabulary datasets are consumed directly as global constants

### 4. Language Portal Model
- Italian, German, and English share one application shell
- Italian uses the deepest feature set
- German and English use dedicated logic in `german-app.js` while reusing global navigation and shared UI conventions where possible

### 5. Local-First Persistence
- Core study data lives in `localStorage`
- Language-specific keys isolate German and English progress
- Custom wordbooks use dynamic per-wordbook progress keys, including language-specific variants
- Import/export provides a portable backup path

## Key Module Responsibilities
- `index.html`: UI structure, screens, modals, script load order
- `styles.css`: global styling, language themes, responsive layouts
- `app.js`: global state, storage, navigation, Italian vocabulary flow, shared utilities
- `app-enhanced.js`: spaced repetition, enhanced stats, wordbook editor, patched behaviors
- `community-wordbooks.js`: Supabase-backed community wordbook workflows
- `conjugation-app.js`: Italian conjugation lookup and practice
- `grammar-book.js`: grammar reader UI for multiple language datasets
- `verb-collocations.js`: Italian collocation reader
- `verb-collocations-practice.js`: Italian collocation practice
- `german-app.js`: German and English vocabulary/practice/control flows

## Data / Build Pattern
- Raw source material lives in language- or feature-specific folders
- Python scripts in `scripts/` transform raw sources into browser-consumable JS data files
- Frontend modules consume generated JS constants rather than rebuilding in-browser

## Important Constraints
- Script order matters because modules rely on globals defined by earlier files
- DOM ID changes can silently break functionality
- Changes in `app.js` may be superseded by overrides in `app-enhanced.js`
- Community features depend on valid Supabase configuration, while core study features do not