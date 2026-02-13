#!/usr/bin/env python3
"""Test LibreTranslate functionality"""

from argostranslate import package, translate

# Download and install language models
def install_languages():
    package.update_package_index()
    available_packages = package.get_available_packages()
    
    print("Available packages:")
    for pkg in available_packages:
        if pkg.from_code == "it" or pkg.to_code == "zh":
            print(f"  {pkg.from_code} -> {pkg.to_code}: {pkg.package_version}")
    
    # Install Italian -> English
    it_en_package = next(
        (p for p in available_packages if p.from_code == "it" and p.to_code == "en"),
        None
    )
    if it_en_package:
        print(f"\nInstalling Italian -> English package...")
        package.install_from_path(it_en_package.download())
    
    # Install English -> Chinese (Simplified)
    en_zh_package = next(
        (p for p in available_packages if p.from_code == "en" and p.to_code == "zh"),
        None
    )
    if en_zh_package:
        print(f"Installing English -> Chinese package...")
        package.install_from_path(en_zh_package.download())

# Test translation
def test_translation():
    # Test Italian to English
    it_text = "ciao"
    en_translation = translate.translate(it_text, "it", "en")
    print(f"\nIT->EN: {it_text} -> {en_translation}")
    
    # Test English to Chinese (two-step: Italian -> English -> Chinese)
    zh_translation = translate.translate(en_translation, "en", "zh")
    print(f"EN->ZH: {en_translation} -> {zh_translation}")
    print(f"IT->ZH (via EN): {it_text} -> {zh_translation}")

if __name__ == "__main__":
    print("Installing language models...")
    install_languages()
    print("\nTesting translations...")
    test_translation()
    print("\nLibreTranslate setup complete!")
