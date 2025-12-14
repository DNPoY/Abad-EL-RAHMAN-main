import re

file_path = r"d:\Code programs\prayer-companion-pro\src\lib\azkar-data.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace multiple newlines with a single newline
# But we might want to keep some structure.
# The issue is likely that every line has an extra newline.
# So we have line\n\nline\n\n

# Let's try to replace \n\n with \n
# But we need to be careful about Windows line endings \r\n
# Python's text mode handles this, so \n in memory is what we care about.

# If we have \n\n everywhere, replacing \n\n with \n is safe.
# If we have \n\n\n (intentional blank line), it becomes \n\n (still a blank line), which is fine.

new_content = re.sub(r'\n{2,}', '\n', content)

# But wait, we might want to keep blank lines between array items for readability.
# If the original code had:
# item1,
#
# item2
#
# Then it became:
# item1,
#
#
#
# item2
#
#
#
# If we reduce all \n+ to \n, we lose the blank lines between items.
# Maybe we should just replace \n\n with \n ONCE?
# No, if it's systematic double spacing, we want to remove one level of spacing.

# Let's look at the file content again.
# 1: export const morningAzkar = [
# 2: 
# 3:   {
# 4: 
# 5:     id: 1,

# It seems every line is followed by a blank line.
# So we can just replace \n\n with \n.
# But if there was a blank line originally, it was \n\n, now it's \n\n\n\n.
# Replacing \n\n with \n will make it \n\n.
# So \n\n -> \n seems correct to revert the "double spacing".

# However, if we have \n\n\n, replacing \n\n with \n might result in \n\n (if done iteratively) or \n\n (if done once).
# re.sub replaces all non-overlapping occurrences.
# \n\n\n -> \n + \n (leftover) -> \n\n.
# \n\n\n\n -> \n + \n -> \n\n.

# So `re.sub(r'\n\n', '\n', content)` should work.

new_content = content.replace('\n\n', '\n')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Successfully fixed spacing")
