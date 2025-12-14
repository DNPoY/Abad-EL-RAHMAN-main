file_path = r"d:\Code programs\prayer-companion-pro\src\lib\azkar-data.ts"
try:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        print(content[:500])
except Exception as e:
    print(f"Error reading utf-8: {e}")
    try:
        with open(file_path, "r", encoding="utf-16") as f:
            content = f.read()
            print("Read as UTF-16")
            print(content[:500])
    except Exception as e2:
        print(f"Error reading utf-16: {e2}")
