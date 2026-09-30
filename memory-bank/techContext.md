# Tech Context

## Stack
- HTML5
- CSS3
- Vanilla JavaScript
- Python scripts for data processing/build steps
- Supabase for community wordbook storage and metadata
- Chart.js for statistics visualization
- marked.js for Markdown rendering
- Web Speech API for pronunciation features

## Runtime Model
- Primary usage is direct local opening of `index.html`
- Optional local server can be used for development/testing
- No mandatory backend for the main study experience

## Key Directories
- Root: app shell, main JS modules, styles, docs
- `data/`: generated datasets and source content used by the frontend
- `scripts/`: Python build/transformation scripts
- `deutsch-data/`: German source data
- `english-data/`: English source data

## Important Data Files
- `data/vocab/{it,de,en,fr}.js`: unified vocabulary datasets (schema v1, see `docs/vocab-schema.md`)
- `data/grammar-data.js`: Italian grammar dataset
- `data/german-grammar-data.js`: German grammar dataset
- `data/english-grammar-data.js`: English grammar dataset
- `data/verb-collocations-data.js`: Italian collocation dataset
- `data/conjugations-*.js`: Italian conjugation datasets

## Build / Maintenance Scripts
- `scripts/build_{german,english,french,italian}_vocabulary*.py` / `scripts/build_english_vocab.py` (emit `data/vocab/<lang>.js`; validated by `scripts/validate_vocab.js`)
- `scripts/build_german_grammar.py`
- `scripts/build_english_vocab.py`
- `scripts/build_english_grammar.py`
- Additional Italian grammar/collocation/conjugation scripts are documented in `CODE_SPACE.md`

## Storage Conventions
- Main app progress and settings: `localStorage`
- German and English use dedicated storage keys for mastered words, stats, and filters
- Custom wordbook progress uses both legacy and language-specific dynamic keys
- Import/export currently uses a versioned backup structure documented in project context

## Development Constraints
- Static hosting compatibility is a core design constraint
- Non-ASCII and spaced file paths exist in source data directories
- Global namespace interactions are part of the current design
- Documentation must be kept up to date because future sessions rely on it