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
    # Find start
    start_marker = f"export const {array_name} = ["
    start_idx = content.find(start_marker)
    if start_idx == -1:
        print(f"Could not find start of {array_name}")
        return content
    
    # Find end (];)
    # We search from start_idx
    end_idx = content.find("];", start_idx)
    if end_idx == -1:
        print(f"Could not find end of {array_name}")
        return content
        
    # Extract block including brackets
    block_start = start_idx + len(start_marker)
    block_end = end_idx
    block_content = content[block_start:block_end]
    
    # 1. Remove prefix from ID 1
    # We search for the specific string in this block
    prefix = "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ\\n"
    if prefix in block_content:
        block_content = block_content.replace(prefix, "")
    else:
        # Try literal newline
        prefix_lit = "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ\n"
        if prefix_lit in block_content:
            block_content = block_content.replace(prefix_lit, "")
        else:
            print(f"Could not find prefix in {array_name}")

    # 2. Replace ID 2
    # We look for the object with id: 2
    # It starts with { and contains id: 2,
    # But regex is better here to find the whole object
    
    # Pattern to match { ... id: 2, ... }
    # We assume standard formatting:
    #   {
    #     id: 2,
    #     ...
    #   },
    
    # Let's match from "  {\n    id: 2," to "  },"
    # Note: The file uses 2 spaces indentation?
    # Let's check the file content again. It seems to use 2 spaces.
    
    id2_pattern = r'\{\s*id: 2,[\s\S]*?Surah Al-Ikhlas, Surah Al-Falaq, Surah An-Nas[\s\S]*?\},'
    
    replacement = ikhlas + "\n" + falaq + "\n" + nas
    
    new_block_content = re.sub(id2_pattern, replacement, block_content, count=1)
    
    if new_block_content == block_content:
        print(f"Could not find ID 2 block in {array_name}")
    else:
        block_content = new_block_content
        
        # 3. Renumber subsequent IDs
        # We need to renumber IDs > 2.
        # We can iterate through all matches of "id: X,"
        
        def renumber(m):
            current_id = int(m.group(1))
            if current_id > 2:
                return f"id: {current_id + 2},"
            return m.group(0)
            
        block_content = re.sub(r'id: (\d+),', renumber, block_content)

    # Reconstruct content
    return content[:block_start] + block_content + content[block_end:]

# Process morningAzkar
content = process_azkar_array(content, "morningAzkar")

# Process eveningAzkar
content = process_azkar_array(content, "eveningAzkar")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully fixed azkar-data.ts v2")
