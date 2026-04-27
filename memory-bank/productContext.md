# Product Context

## Why This Project Exists
Dimenticato began as an Italian vocabulary memorization app and has evolved into a multi-language study site. Its purpose is to provide a lightweight, low-friction study tool that works locally, avoids mandatory backend infrastructure, and keeps learning data under the user’s control.

## Problems It Solves
- Makes high-frequency vocabulary study accessible without requiring account creation or online services
- Gives users an offline-capable study tool for Italian, German, and English
- Supports both built-in system vocabulary and user-owned custom wordbooks
- Adds supporting study materials such as grammar books and Italian verb tools
- Preserves progress through local storage and portable export/import

## Intended User Experience
- Open `index.html` and start studying immediately
- Switch languages from a shared interface without losing context
- Choose between system vocabulary, custom wordbooks, and community resources
- Use simple practice modes such as multiple choice, spelling, and browse
- Access grammar content in a reader-style interface
- Manage learning data locally with optional backup/restore

## Product Priorities
1. Keep the app simple to run and distribute
2. Preserve the strong Italian learning experience
3. Continue maturing German and English without breaking the Italian core
4. Maintain shared infrastructure where practical, while isolating per-language progress
5. Prefer static/precompiled data pipelines over fragile runtime fetch behavior

## Current UX Reality
- Italian is the main production experience
- German and English are functional but narrower in scope
- Community wordbooks are shared across languages, with language-aware metadata and filtering
- Navigation and history behavior are increasingly unified across all language portals