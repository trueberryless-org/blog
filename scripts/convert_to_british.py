import json
import re
from pathlib import Path

# Load mapping
with open("scripts/american_to_british.json", encoding="utf-8") as f:
    mapping = json.load(f)

# Compile regex to match whole words only, case-insensitive
patterns = {
    re.compile(rf"\b{re.escape(us)}\b", re.IGNORECASE): uk
    for us, uk in mapping.items()
}

docs_path = Path("./starlight/src/content/docs")

for file_path in docs_path.glob("*"):
    if file_path.is_file():
        text = file_path.read_text(encoding="utf-8")
        new_text = text
        for pattern, replacement in patterns.items():
            new_text = pattern.sub(lambda m: replacement if m.group(0).islower()
                                   else replacement.capitalize(), new_text)
        if new_text != text:
            file_path.write_text(new_text, encoding="utf-8")
            print(f"Updated {file_path}")
