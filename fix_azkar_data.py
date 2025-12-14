import re

file_path = r"d:\Code programs\prayer-companion-pro\src\lib\azkar-data.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Define the new items for the 3 Quls
ikhlas = """  {
    id: 2,
    arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\\nقُلْ هُوَ اللَّهُ أَحَدٌ ۞ اللَّهُ الصَّمَدُ ۞ لَمْ يَلِدْ وَلَمْ يُولَدْ ۞ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ",
    transliteration: "Bismillahir-Rahmanir-Rahim. Qul Huwallahu Ahad. Allahus-Samad. Lam yalid wa lam yulad. Wa lam yakun lahu kufuwan ahad.",
    translation: "Say, 'He is Allah, [who is] One, Allah, the Eternal Refuge. He neither begets nor is born, Nor is there to Him any equivalent.'",
    count: 3,
  },"""

falaq = """  {
    id: 3,
    arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۞ مِنْ شَرِّ مَا خَلَقَ ۞ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ۞ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۞ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ",
    transliteration: "Bismillahir-Rahmanir-Rahim. Qul a'udhu bi-rabbil-falaq. Min sharri ma khalaq. Wa min sharri ghasiqin idha waqab. Wa min sharrin-naffathati fil-'uqad. Wa min sharri hasidin idha hasad.",
    translation: "Say, 'I seek refuge in the Lord of daybreak From the evil of that which He created And from the evil of darkness when it settles And from the evil of the blowers in knots And from the evil of an envier when he envies.'",
    count: 3,
  },"""

nas = """  {
    id: 4,
    arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ ۞ مَلِكِ النَّاسِ ۞ إِلَٰهِ النَّاسِ ۞ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۞ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۞ مِنَ الْجِنَّةِ وَالنَّاسِ",
    transliteration: "Bismillahir-Rahmanir-Rahim. Qul a'udhu bi-rabbin-nas. Malikin-nas. Ilahin-nas. Min sharril-waswasil-khannas. Alladhi yuwaswisu fi sudurin-nas. Minal-jinnati wan-nas.",
    translation: "Say, 'I seek refuge in the Lord of mankind, The Sovereign of mankind. The God of mankind, From the evil of the retreating whisperer - Who whispers [evil] into the breasts of mankind - From among the jinn and mankind.'",
    count: 3,
  },"""

def process_azkar_array(content, array_name):
    start_marker = f"export const {array_name} = ["
    end_marker = "];"
    
    start_idx = content.find(start_marker)
    if start_idx == -1:
        return content
        
    # Find the end of this array (assuming ]; is at the start of a line)
    # We need to be careful not to find a ]; inside a string or something, but here it should be fine.
    # We'll search for "];" after start_idx
    
    # Actually, let's just use regex to match the whole array block if possible, 
    # or iterate through lines.
    
    # Let's split the content into lines to handle it line by line
    lines = content.split('\n')
    
    new_lines = []
    in_target_array = False
    array_start_line_idx = -1
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        if start_marker in line:
            in_target_array = True
            new_lines.append(line)
            i += 1
            continue
            
        if in_target_array and line.strip() == "];":
            in_target_array = False
            new_lines.append(line)
            i += 1
            continue
            
        if in_target_array:
            # We are inside the array. We need to parse the objects.
            # This is tricky with simple line iteration because objects span multiple lines.
            # Let's try a different approach: Regex replacement on the block.
            pass
        
        if not in_target_array:
            new_lines.append(line)
            i += 1
            
    # Regex approach seems safer for the block manipulation
    pattern = re.compile(r'export const ' + array_name + r' = \[\s*({[\s\S]*?})\s*\];', re.MULTILINE)
    match = pattern.search(content)
    
    if not match:
        print(f"Could not find {array_name}")
        return content
        
    full_match = match.group(0)
    inner_content = match.group(1)
    
    # Split objects by "},\n  {"
    # This is also fragile.
    
    # Let's just do text replacement for the specific known strings.
    
    # 1. Remove "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ\n" from ID 1
    # We know ID 1 is the first item.
    
    # Find the ID 1 block
    id1_pattern = r'id: 1,\s*arabic: "(.*?)"'
    
    def remove_prefix(m):
        arabic_text = m.group(1)
        prefix = "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ\\n"
        if prefix in arabic_text:
            return f'id: 1,\n    arabic: "{arabic_text.replace(prefix, "")}"'
        # Try with literal newline just in case
        prefix_lit = "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ\n"
        if prefix_lit in arabic_text:
             return f'id: 1,\n    arabic: "{arabic_text.replace(prefix_lit, "")}"'
        return m.group(0)

    # Apply to the specific array block only
    block = full_match
    block = re.sub(id1_pattern, remove_prefix, block, count=1, flags=re.DOTALL)
    
    # 2. Replace ID 2 with the 3 new items
    # Identify the ID 2 block. It starts with { id: 2, and ends with },
    # It contains "Surah Al-Ikhlas, Surah Al-Falaq, Surah An-Nas"
    
    id2_pattern = r'\{\s*id: 2,[\s\S]*?Surah Al-Ikhlas, Surah Al-Falaq, Surah An-Nas[\s\S]*?\},'
    
    replacement = ikhlas + "\n" + falaq + "\n" + nas
    
    block = re.sub(id2_pattern, replacement, block, count=1)
    
    # 3. Renumber subsequent IDs
    # We need to find all "id: X," where X > 2, and increment by 2.
    # Since we replaced ID 2 with IDs 2, 3, 4, the next one (originally 3) should become 5.
    
    def renumber(m):
        current_id = int(m.group(1))
        if current_id > 2:
            return f"id: {current_id + 2},"
        return m.group(0)
        
    block = re.sub(r'id: (\d+),', renumber, block)
    
    # Replace the original block in content
    content = content.replace(full_match, block)
    
    return content

# Process morningAzkar
content = process_azkar_array(content, "morningAzkar")

# Process eveningAzkar
content = process_azkar_array(content, "eveningAzkar")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully fixed azkar-data.ts")
