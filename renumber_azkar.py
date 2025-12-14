import re

file_path = r"d:\Code programs\prayer-companion-pro\src\lib\azkar-data.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

def renumber_array(content, array_name):
    # Find start
    start_marker = f"export const {array_name} = ["
    start_idx = content.find(start_marker)
    if start_idx == -1:
        return content
    
    # Find end
    end_idx = content.find("];", start_idx)
    if end_idx == -1:
        return content
        
    block_start = start_idx + len(start_marker)
    block_end = end_idx
    block_content = content[block_start:block_end]
    
    # Find all "id: X," and replace sequentially
    # We use a counter in a closure
    counter = 1
    
    def replace_id(match):
        nonlocal counter
        new_id = f"id: {counter},"
        counter += 1
        return new_id
        
    new_block_content = re.sub(r'id: \d+,', replace_id, block_content)
    
    return content[:block_start] + new_block_content + content[block_end:]

content = renumber_array(content, "morningAzkar")
content = renumber_array(content, "eveningAzkar")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully renumbered azkar-data.ts")
