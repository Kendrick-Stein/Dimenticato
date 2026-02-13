#!/usr/bin/env python3
"""
Enhance vocabulary.json with English and Chinese translations
- Rename existing 'english' field to 'dictionary' 
- Add new 'english' field with clean English translation
- Add new 'chinese' field with Chinese translation
"""

import json
import time
import shutil
from pathlib import Path
from argostranslate import translate

def backup_original():
    """Backup original vocabulary.json"""
    original = Path("data/vocabulary.json")
    backup = Path("data/vocabulary.json.backup")
    
    if original.exists():
        shutil.copy2(original, backup)
        print(f"✓ Backed up original to {backup}")
    else:
        print(f"✗ Original file not found: {original}")
        return False
    return True

def translate_italian(italian_word):
    """Translate Italian word to English and Chinese"""
    try:
        # Italian -> English
        english = translate.translate(italian_word, "it", "en").strip()
        
        # English -> Chinese (via Italian->English->Chinese)
        chinese = translate.translate(english, "en", "zh").strip()
        
        return english, chinese
    except Exception as e:
        print(f"  ✗ Translation error for '{italian_word}': {e}")
        return "", ""

def enhance_vocabulary():
    """Process all vocabulary entries"""
    
    # Backup first
    if not backup_original():
        return
    
    # Load original data (it's a JSON array)
    input_file = Path("data/vocabulary.json")
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    total = len(data)
    print(f"\nProcessing {total} vocabulary entries...")
    print("This will take several hours. Progress will be saved every 100 words.\n")
    
    enhanced_entries = []
    
    for i, entry in enumerate(data, 1):
        try:
            # Rename 'english' to 'dictionary'
            dictionary = entry.get('english', '')
            
            # Translate Italian to English and Chinese
            italian = entry['italian']
            english, chinese = translate_italian(italian)
            
            # Create enhanced entry
            enhanced_entry = {
                'italian': italian,
                'dictionary': dictionary,
                'english': english,
                'chinese': chinese,
                'frequency': entry.get('frequency', 0),
                'rank': entry.get('rank', i)
            }
            
            enhanced_entries.append(enhanced_entry)
            
            # Progress output
            if i % 10 == 0:
                print(f"[{i}/{total}] {italian} -> EN: {english}, ZH: {chinese}")
            
            # Save progress every 100 entries
            if i % 100 == 0:
                save_progress(enhanced_entries)
                print(f"  ✓ Progress saved ({i}/{total} completed)")
            
            # Small delay to avoid overwhelming the system
            if i % 50 == 0:
                time.sleep(0.5)
                
        except Exception as e:
            print(f"  ✗ Error processing entry {i}: {e}")
            # Add entry with empty translations on error
            enhanced_entries.append({
                'italian': entry.get('italian', ''),
                'dictionary': entry.get('english', ''),
                'english': '',
                'chinese': '',
                'frequency': entry.get('frequency', 0),
                'rank': entry.get('rank', i)
            })
            continue
    
    # Save final result
    save_progress(enhanced_entries, final=True)
    print(f"\n✓ All {total} entries processed successfully!")
    print(f"✓ Enhanced vocabulary saved to data/vocabulary.json")
    print(f"✓ Original backup at data/vocabulary.json.backup")

def save_progress(entries, final=False):
    """Save progress to file"""
    output_file = Path("data/vocabulary.json" if final else "data/vocabulary_progress.json")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    print("=" * 60)
    print("Vocabulary Translation Enhancement")
    print("=" * 60)
    enhance_vocabulary()
