import os
from PIL import Image, ImageOps, ImageDraw

# Configuration
SOURCE_IMAGE_PATH = r"C:/Users/Ahmed El/.gemini/antigravity/brain/a17d4dbd-e7ca-4347-aae0-23c7b718b366/uploaded_image_1764768605579.jpg"
ANDROID_RES_DIR = r"d:/Code programs/prayer-companion-pro/android/app/src/main/res"

ICON_SIZES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192
}

def create_circular_mask(size):
    mask = Image.new('L', size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0) + size, fill=255)
    return mask

def process_icons():
    try:
        if not os.path.exists(SOURCE_IMAGE_PATH):
            print(f"Error: Source image not found at {SOURCE_IMAGE_PATH}")
            return

        img = Image.open(SOURCE_IMAGE_PATH)
        width, height = img.size
        print(f"Original image size: {width}x{height}")

        # Crop the center square
        # Assuming the icon is in the center. 
        # Looking at the image, it's a wide banner. The icon is a square in the middle.
        # Let's estimate the square size based on height (since it's likely fitting vertically)
        # or a bit smaller than height to avoid borders.
        
        # Let's take a safe crop. 
        # If the image is 16:9, the center square is roughly height x height.
        min_dim = min(width, height)
        
        # Crop size: let's use 80% of the height to be safe and capture the icon without too much margin
        crop_size = int(min_dim * 0.6) 
        
        left = (width - crop_size) // 2
        top = (height - crop_size) // 2
        right = (width + crop_size) // 2
        bottom = (height + crop_size) // 2
        
        icon_img = img.crop((left, top, right, bottom))
        print(f"Cropped icon size: {crop_size}x{crop_size}")

        # Resize and save
        for folder, size in ICON_SIZES.items():
            target_dir = os.path.join(ANDROID_RES_DIR, folder)
            if not os.path.exists(target_dir):
                os.makedirs(target_dir)
            
            # Square Icon
            resized_icon = icon_img.resize((size, size), Image.Resampling.LANCZOS)
            square_path = os.path.join(target_dir, "ic_launcher.png")
            resized_icon.save(square_path)
            print(f"Saved {square_path}")

            # Round Icon
            round_icon = resized_icon.copy()
            mask = create_circular_mask((size, size))
            round_icon.putalpha(mask)
            round_path = os.path.join(target_dir, "ic_launcher_round.png")
            round_icon.save(round_path)
            print(f"Saved {round_path}")

        print("Icon update complete.")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    process_icons()
