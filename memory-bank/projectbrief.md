# Project Brief

## Project
Dimenticato is a static, offline-first language learning web app centered on vocabulary study, with additional grammar and verb-support modules.

## Current Scope
- Supports three language portals:
  - Italian: primary and most feature-complete experience
  - German: vocabulary + grammar book + basic progress/settings
  - English: vocabulary + grammar book + basic progress/settings
- Runs directly from `index.html` without a backend for core learning flows
- Uses Supabase only for community wordbook features

## Core Product Areas
- System vocabulary practice
- Custom wordbook import, management, and study
- Community wordbook browse/upload/import
- Grammar book reading
- Italian verb conjugation practice
- Italian verb collocations reading and practice
- Progress tracking and data import/export

## Product Shape
- Pure static frontend using HTML, CSS, and vanilla JavaScript
- Data is largely precompiled into JS constants for browser-side consumption
- Local-first persistence via `localStorage`
- Designed for direct local use and GitHub Pages-style deployment

## Success Criteria
- Users can open the app locally and immediately study vocabulary offline
- Learning progress persists locally across sessions
- Multiple languages can coexist without overwriting each other’s progress
- Content modules remain modular and maintainable despite static-site constraints

## Source Notes
This initial brief is derived from `README.md`, `goal.txt`, and `CODE_SPACE.md`.