#!/usr/bin/env python3
"""
Parallel version of vocabulary translation enhancement
Uses multiprocessing to speed up translation process
"""

import json
import time
import shutil
from pathlib import Path
from argostranslate import translate
from multiprocessing import Pool, Manager, cpu_count
import sys

def backup_original():
    """Backup original vocabulary.json"""
    original = Path("data/vocabulary.json")
    backup = Path("data/vocabulary.json.backup")
    
    if original.exists() and not backup.exists():
        shutil.copy2(original, backup)
        print(f"✓ Backed up original to {backup}", flush=True)
    return True

def translate_word(args):
    """Translate a single word (for parallel processing)"""
    entry, index, total = args
    
    try:
        italian = entry['italian']
        dictionary = entry.get('english', '')
        
        # Italian -> English
        english = translate.translate(italian, "it", "en").strip()
        
        # English -> Chinese
        chinese = translate.translate(english, "en", "zh").strip()
        
        enhanced_entry = {
            'italian': italian,
            'dictionary': dictionary,
            'english': english,
            'chinese': chinese,
            'frequency': entry.get('frequency', 0),
            'rank': entry.get('rank', index)
        }
        
        # Print progress every 50 words
        if index % 50 == 0:
            print(f"[{index}/{total}] {italian} -> EN: {english}, ZH: {chinese}", flush=True)
        
        return enhanced_entry
        
    except Exception as e:
        print(f"✗ Error at {index}: {e}", flush=True)
        return {
            'italian': entry.get('italian', ''),
            'dictionary': entry.get('english', ''),
            'english': '',
            'chinese': '',
            'frequency': entry.get('frequency', 0),
            'rank': entry.get('rank', index)
        }

def save_progress(entries, final=False):
    """Save progress to file"""
    output_file = Path("data/vocabulary.json" if final else "data/vocabulary_progress.json")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)
    
    print(f"✓ Saved {len(entries)} entries to {output_file}", flush=True)

def enhance_vocabulary_parallel():
    """Process vocabulary with parallel translation"""
    
    # Backup first
    backup_original()
    
    # Load original data
    input_file = Path("data/vocabulary.json")
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    total = len(data)
    
    # Check if we have progress from previous run
    progress_file = Path("data/vocabulary_progress.json")
    start_index = 0
    enhanced_entries = []
    
    if progress_file.exists():
        with open(progress_file, 'r', encoding='utf-8') as f:
            enhanced_entries = json.load(f)
            start_index = len(enhanced_entries)
        print(f"✓ Resuming from entry {start_index}/{total}", flush=True)
    
    print(f"\n{'='*60}", flush=True)
    print(f"Processing {total - start_index} remaining entries", flush=True)
    print(f"Using {cpu_count()} CPU cores for parallel processing", flush=True)
    print(f"{'='*60}\n", flush=True)
    
    # Prepare remaining entries with indices
    remaining_data = [(entry, i + 1, total) for i, entry in enumerate(data[start_index:], start_index)]
    
    # Process in batches for better progress tracking
    batch_size = 100
    num_batches = (len(remaining_data) + batch_size - 1) // batch_size
    
    # Use fewer workers to avoid overwhelming the system
    num_workers = min(4, cpu_count())
    
    try:
        with Pool(processes=num_workers) as pool:
            for batch_num in range(num_batches):
                batch_start = batch_num * batch_size
                batch_end = min(batch_start + batch_size, len(remaining_data))
                batch = remaining_data[batch_start:batch_end]
                
                print(f"\n--- Batch {batch_num + 1}/{num_batches} (entries {start_index + batch_start + 1}-{start_index + batch_end}) ---", flush=True)
                
                # Process batch in parallel
                batch_results = pool.map(translate_word, batch)
                enhanced_entries.extend(batch_results)
                
                # Save progress after each batch
                save_progress(enhanced_entries)
                print(f"✓ Batch {batch_num + 1} complete ({len(enhanced_entries)}/{total} total)", flush=True)
                
    except KeyboardInterrupt:
        print("\n\n⚠ Interrupted by user. Saving progress...", flush=True)
        save_progress(enhanced_entries)
        print(f"✓ Progress saved. Completed {len(enhanced_entries)}/{total} entries.", flush=True)
        sys.exit(0)
    
    # Save final result
    save_progress(enhanced_entries, final=True)
    print(f"\n{'='*60}", flush=True)
    print(f"✓ All {total} entries processed successfully!", flush=True)
    print(f"✓ Enhanced vocabulary saved to data/vocabulary.json", flush=True)
    print(f"✓ Original backup at data/vocabulary.json.backup", flush=True)
    print(f"{'='*60}\n", flush=True)

if __name__ == "__main__":
    enhance_vocabulary_parallel()
