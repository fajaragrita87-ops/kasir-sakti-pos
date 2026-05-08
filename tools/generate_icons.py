# Script untuk generate ikon PWA dalam berbagai ukuran
# Jalankan: python generate_icons.py
# Requires: pip install Pillow

from PIL import Image
import os

SOURCE_IMAGE = "source_icon.png"
OUTPUT_DIR = "../apps/web/public/icons"
SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

os.makedirs(OUTPUT_DIR, exist_ok=True)

if not os.path.exists(SOURCE_IMAGE):
    print(f"ERROR: Letakkan file '{SOURCE_IMAGE}' di folder yang sama dengan script ini")
    print("File ini adalah ikon utama Kasir Sakti (512x512 PNG)")
    exit(1)

img = Image.open(SOURCE_IMAGE)

for size in SIZES:
    resized = img.resize((size, size), Image.LANCZOS)
    output_path = os.path.join(OUTPUT_DIR, f"icon-{size}x{size}.png")
    resized.save(output_path, "PNG")
    print(f"✅ Generated: {output_path}")

print(f"\n🎉 Selesai! {len(SIZES)} ikon berhasil dibuat di folder: {OUTPUT_DIR}")
