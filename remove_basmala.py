import re

file_path = r"d:\Code programs\prayer-companion-pro\src\lib\azkar-data.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Arabic Basmala to remove
# Note: The file might have literal newlines or \n characters.
# Based on previous steps, we fixed literal newlines to be \n.
# But let's handle both just in case.

# The string is: بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
# followed by a newline.

# Regex for Arabic
# We match the specific string at the start of the content inside quotes
# arabic: "..."
# We want to remove the start.

def remove_arabic_basmala(match):
    full_match = match.group(0) # arabic: "..."
    # Extract content inside quotes
    # We assume standard double quotes
    prefix = 'arabic: "'
    suffix = '"'
    
    if not full_match.startswith(prefix) or not full_match.endswith(suffix):
        return full_match
        
    inner = full_match[len(prefix):-len(suffix)]
    
    # Basmala string
    basmala = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
    
    # Check if it starts with Basmala
    # It might be followed by \n or literal newline
    
    if inner.startswith(basmala):
        # Remove basmala
        inner = inner[len(basmala):]
        # Remove leading whitespace/newlines
        inner = inner.lstrip()
        # Also remove explicit \n if present
        if inner.startswith("\\n"):
            inner = inner[2:]
        inner = inner.lstrip()
        
        return f'{prefix}{inner}{suffix}'
    
    return full_match

# Regex for Transliteration
def remove_transliteration_basmala(match):
    full_match = match.group(0)
    prefix = 'transliteration: "'
    suffix = '"'
    
    if not full_match.startswith(prefix) or not full_match.endswith(suffix):
        return full_match
        
    inner = full_match[len(prefix):-len(suffix)]
    
    basmala = "Bismillahir-Rahmanir-Rahim."
    
    if inner.startswith(basmala):
        inner = inner[len(basmala):].strip()
        return f'{prefix}{inner}{suffix}'
        
    return full_match

# Apply regex
# We use re.DOTALL to match across lines if needed, though our previous fix made them single line strings with \n
# But let's be safe.

# Arabic
# Match arabic: "..."
# Be careful not to match too much. Non-greedy match until closing quote.
# But if there are escaped quotes, this is simple regex might fail.
# Assuming no escaped quotes for now as per file content.
content = re.sub(r'arabic: "[^"]*"', remove_arabic_basmala, content)

# Transliteration
content = re.sub(r'transliteration: "[^"]*"', remove_transliteration_basmala, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully removed Basmala")
