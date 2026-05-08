"""
猫キャラクターシート処理スクリプト
  - 白背景を除去
  - 4x2グリッドを8コマに分割
  - 上段4コマ → idle スプライトストリップ（横並び）
  - 下段4コマ → 表情フレーム（個別 PNG）
"""

from PIL import Image
import numpy as np
import os

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE_DIR = os.path.join(PROJECT, "public", "cats", "source")
OUT_DIR    = os.path.join(PROJECT, "public", "cats", "sprites")
os.makedirs(OUT_DIR, exist_ok=True)

CATS = {
    "black":  "black.png",
    "tabby":  "tabby.png",
    "calico": "calico.png",
}

# 下段コマ順：左から happy / sparkle / sad / normal
EXPRESSIONS = ["happy", "sparkle", "sad", "normal"]


def remove_white_bg(img: Image.Image, threshold: int = 240) -> Image.Image:
    """白〜明るいグレーを透明化する"""
    img = img.convert("RGBA")
    data = np.array(img, dtype=np.uint8)
    r, g, b = data[:, :, 0], data[:, :, 1], data[:, :, 2]
    white = (r >= threshold) & (g >= threshold) & (b >= threshold)
    data[white, 3] = 0
    return Image.fromarray(data)


def trim_transparent(img: Image.Image, padding: int = 4) -> Image.Image:
    """透明領域をトリミングして少しパディングを追加"""
    bbox = img.getbbox()
    if bbox is None:
        return img
    l, t, r, b = bbox
    l = max(0, l - padding)
    t = max(0, t - padding)
    r = min(img.width,  r + padding)
    b = min(img.height, b + padding)
    return img.crop((l, t, r, b))


def process(name: str, filename: str, cols: int = 4, rows: int = 2):
    path = os.path.join(SOURCE_DIR, filename)
    src  = Image.open(path).convert("RGBA")
    W, H = src.size
    cw, ch = W // cols, H // rows

    print(f"\n[{name}]  ({W}x{H}px  cell={cw}x{ch})")

    # グリッドを分割して白抜き
    cells = []
    for row in range(rows):
        for col in range(cols):
            cell = src.crop((col * cw, row * ch, (col + 1) * cw, (row + 1) * ch))
            cell_nobg = remove_white_bg(cell)
            cells.append(cell_nobg)

    # ── idle スプライトストリップ（上段4コマ横並び）
    strip = Image.new("RGBA", (cw * 4, ch), (0, 0, 0, 0))
    for i, cell in enumerate(cells[:4]):
        strip.paste(cell, (i * cw, 0), cell)
    strip_path = os.path.join(OUT_DIR, f"{name}-idle.png")
    strip.save(strip_path, optimize=True)
    print(f"  OK {name}-idle.png  ({cw*4}x{ch}px)")

    # ── 表情フレーム（下段4コマ個別保存）
    for i, expr in enumerate(EXPRESSIONS):
        cell = cells[4 + i]
        out_path = os.path.join(OUT_DIR, f"{name}-{expr}.png")
        cell.save(out_path, optimize=True)
        print(f"  OK {name}-{expr}.png")


if __name__ == "__main__":
    for name, fn in CATS.items():
        process(name, fn)

    print("\nDone!")
    print(f"   出力先: {OUT_DIR}")
