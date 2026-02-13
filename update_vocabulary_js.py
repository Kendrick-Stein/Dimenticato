#!/usr/bin/env python3
"""
Update vocabulary.js with enhanced vocabulary data
Converts the JSON data to a JavaScript constant
"""

import json
from pathlib import Path

def update_vocabulary_js():
    """Read enhanced vocabulary.json and write to vocabulary.js"""
    
    # Read the enhanced vocabulary
    vocab_file = Path("data/vocabulary.json")
    with open(vocab_file, 'r', encoding='utf-8') as f:
        vocabulary_data = json.load(f)
    
    # Create the JavaScript file content
    js_content = f"""// Italian Vocabulary Data - Enhanced with translations
// Total entries: {len(vocabulary_data)}
// Structure: {{italian, dictionary, english, chinese, frequency, rank}}

const VOCABULARY_DATA = {json.dumps(vocabulary_data, ensure_ascii=False, indent=2)};

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {{
    module.exports = VOCABULARY_DATA;
}}
"""
    
    # Write to vocabulary.js
    output_file = Path("vocabulary.js")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"✓ Updated vocabulary.js with {len(vocabulary_data)} entries")
    print(f"✓ File size: {output_file.stat().st_size / 1024 / 1024:.2f} MB")

if __name__ == "__main__":
    print("=" * 60)
    print("Update vocabulary.js")
    print("=" * 60)
    update_vocabulary_js()
