import os

file_path = r"d:\Code programs\prayer-companion-pro\src\lib\azkar-data.ts"
append_file_path = r"d:\Code programs\prayer-companion-pro\append_azkar.ts"

# 1. Read the corrupted file as binary
with open(file_path, "rb") as f:
    data = f.read()

# 2. Find the end of the valid content
# We expect the file to end with ]; (plus maybe whitespace) before the corruption
# The corruption started when we appended.
# We know afterPrayerAzkar ends with ];
# Let's look for the last occurrence of b"];" that is followed by suspicious bytes or EOF
# Actually, let's just find the last ]; and assume everything after is the appended part (which might be corrupted)

last_bracket_idx = data.rfind(b"];")

if last_bracket_idx == -1:
    print("Could not find ]; in file")
    exit(1)

# Keep everything up to ];
valid_data = data[:last_bracket_idx+2]

# Decode valid data
try:
    content = valid_data.decode("utf-8")
except UnicodeDecodeError:
    # If valid data is also corrupted, we have a bigger problem.
    # But the error was at position 43403, which is likely at the end.
    print("Error decoding valid data, trying to recover...")
    content = valid_data.decode("utf-8", errors="replace")

# 3. Fix syntax errors (literal newlines in strings)
# We look for lines that don't end with , or { or [ or : or " or ' or ` or ;
# and are inside a string.
# Actually, the specific issue we saw was:
# arabic: "text
# text"
# We can just replace literal newlines inside double quotes.

def fix_newlines_in_quotes(text):
    new_text = ""
    in_quote = False
    for char in text:
        if char == '"':
            in_quote = not in_quote
        
        if in_quote and char == '\n':
            new_text += "\\n"
        elif in_quote and char == '\r':
            pass # ignore CR inside quotes
        else:
            new_text += char
    return new_text

# A safer approach for the specific issue we created:
# We know we inserted:
# arabic: "line1\nline2"
# but it became:
# arabic: "line1
# line2"
# We can regex replace this.

import re
# Match double quoted string that spans multiple lines
# We need to be careful not to match across different fields.
# The bad strings are like " ... \n ... "
# We can replace \n with \n inside "..."

def replacer(match):
    s = match.group(0)
    # Replace literal newlines with \n
    return s.replace('\n', '\\n').replace('\r', '')

# Regex for double quoted string, possibly multi-line
# We assume it doesn't contain escaped quotes for simplicity, or we handle it.
# The text is Arabic, so it might contain anything.
# But we know the structure.
pattern = re.compile(r'"[^"]*"', re.DOTALL)
content = pattern.sub(replacer, content)


# 4. Read the append file
with open(append_file_path, "r", encoding="utf-8") as f:
    append_content = f.read()

# 5. Combine
final_content = content + "\n\n" + append_content

# 6. Write back
with open(file_path, "w", encoding="utf-8") as f:
    f.write(final_content)

print("Successfully fixed encoding and syntax")
