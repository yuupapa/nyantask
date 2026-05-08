"""
猫キャラクターシート処理スクリプト
  - 白背景を除去
  - 4x2グリッドを8コマに分割
  - 上段4コマ → idle スプライトストリップ（横並び）
    ※ 体の中心を全フレームで揃えて横ブレを除去
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


def get_body_center_x(img: Image.Image, top_fraction: float = 0.60) -> int:
    """
    画像上部 top_fraction の透明でないピクセルの水平中心を返す。
    しっぽ（下部）を除外して体・頭の中心を取得する。
    """
    data = np.array(img.convert("RGBA"))
    h = data.shape[0]
    top_h = int(h * top_fraction)
    alpha = data[:top_h, :, 3]
    cols = np.where(alpha > 20)[1]
    if len(cols) == 0:
        return img.width // 2  # フォールバック
    return int((int(cols.min()) + int(cols.max())) / 2)


def align_frames(frames: list) -> list:
    """
    全フレームの体の中心X座標を揃えて横ブレを除去する。
    各フレームを左右にシフトし、体がほぼ同じ位置に見えるよう調整。
    """
    centers = [get_body_center_x(f) for f in frames]
    target = int(sum(centers) / len(centers))  # 全フレームの平均を目標中心に
    print(f"    body centers: {centers}  -> target: {target}")

    aligned = []
    for frame, cx in zip(frames, centers):
        offset = target - cx
        if offset == 0:
            aligned.append(frame)
            continue
        shifted = Image.new("RGBA", frame.size, (0, 0, 0, 0))
        # offset が正 = 右にシフト、負 = 左にシフト
        shifted.paste(frame, (offset, 0), frame)
        aligned.append(shifted)
    return aligned


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
            cells.append(remove_white_bg(cell))

    # ── idle: 体中心を揃えてから横並びストリップを生成
    idle_aligned = align_frames(cells[:4])
    strip = Image.new("RGBA", (cw * 4, ch), (0, 0, 0, 0))
    for i, cell in enumerate(idle_aligned):
        strip.paste(cell, (i * cw, 0), cell)
    strip.save(os.path.join(OUT_DIR, f"{name}-idle.png"), optimize=True)
    print(f"  OK {name}-idle.png  ({cw*4}x{ch}px, aligned)")

    # ── 表情フレーム（下段4コマ個別保存）
    for i, expr in enumerate(EXPRESSIONS):
        cells[4 + i].save(
            os.path.join(OUT_DIR, f"{name}-{expr}.png"), optimize=True
        )
        print(f"  OK {name}-{expr}.png")


if __name__ == "__main__":
    for name, fn in CATS.items():
        process(name, fn)

    print("\nDone!")
    print(f"   -> {OUT_DIR}")
