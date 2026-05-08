"""
猫キャラクターシート処理スクリプト
  - 白背景を除去
  - 4x2グリッドを8コマに分割
  - 上段4コマ → idle フレームを1枚ずつ個別保存（{name}-idle-0.png 〜 -3.png）
    ※ 体の中心を全フレームで揃えて横ブレを除去
    ※ 出力幅を FIXED_FRAME_W=520px に拡張してシフト時の尻尾クリップを防止
    ※ 本体から遠い孤立破片のみ除去（尻尾は保持）
  - 下段4コマ → 表情フレーム（個別 PNG: happy / sparkle / sad / normal）
"""

from PIL import Image
from scipy.ndimage import label as ndlabel, binary_dilation
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

# 体アライメント後の出力幅（元の418pxより広くして尻尾クリップを防止）
# 体中心が FIXED_FRAME_W//2 = 260px に揃えられる
FIXED_FRAME_W = 520


def remove_white_bg(img: Image.Image, threshold: int = 240) -> Image.Image:
    """白〜明るいグレーを透明化する"""
    img = img.convert("RGBA")
    data = np.array(img, dtype=np.uint8)
    r, g, b = data[:, :, 0], data[:, :, 1], data[:, :, 2]
    white = (r >= threshold) & (g >= threshold) & (b >= threshold)
    data[white, 3] = 0
    return Image.fromarray(data)


def keep_body_and_nearby(img: Image.Image, proximity_px: int = 20) -> Image.Image:
    """
    猫本体（最大連結成分）とその proximity_px ピクセル以内にある領域を保持し、
    それ以外の孤立破片（隣フレームの尻尾など）を透明化する。

    従来の「最大成分のみ保持」と異なり、
    本体に近い尻尾の細い接続部も正しく保持できる。
    """
    data = np.array(img.convert("RGBA"))
    alpha = data[:, :, 3] > 20

    labeled, n = ndlabel(alpha)
    if n <= 1:
        return img

    counts = np.bincount(labeled.ravel())
    counts[0] = 0
    main_mask = labeled == int(counts.argmax())

    # 最大成分を proximity_px 膨張させて「保持ゾーン」を作成
    struct = np.ones((proximity_px * 2 + 1, proximity_px * 2 + 1), dtype=bool)
    near_main = binary_dilation(main_mask, structure=struct)

    # 元のアルファで保持ゾーン内にあるピクセルを残す
    keep_mask = alpha & near_main
    removed_px = int(alpha.sum() - keep_mask.sum())
    if removed_px > 0:
        print(f"    fragment filter: removed {removed_px}px "
              f"(>{proximity_px}px from main body)")

    new_data = data.copy()
    new_data[~keep_mask, 3] = 0
    return Image.fromarray(new_data)


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
        return img.width // 2
    return int((int(cols.min()) + int(cols.max())) / 2)


def align_frames(frames: list) -> list:
    """
    全フレームの体の中心X座標を FIXED_FRAME_W//2 に揃えて横ブレを除去する。
    出力幅を FIXED_FRAME_W に拡張することで、シフト時の尻尾クリップを防止する。
    """
    centers = [get_body_center_x(f) for f in frames]
    target = int(sum(centers) / len(centers))
    print(f"    body centers: {centers}  -> target: {target}")

    W, H = frames[0].size
    body_target_x = FIXED_FRAME_W // 2  # 260px

    aligned = []
    for frame, cx in zip(frames, centers):
        paste_x = body_target_x - cx
        canvas = Image.new("RGBA", (FIXED_FRAME_W, H), (0, 0, 0, 0))
        canvas.paste(frame, (paste_x, 0), frame)

        # クリップが発生していないかチェック
        if paste_x < 0:
            print(f"    WARN: still clips {-paste_x}px on left (cx={cx})")
        if paste_x + W > FIXED_FRAME_W:
            print(f"    WARN: still clips {paste_x+W-FIXED_FRAME_W}px on right (cx={cx})")

        aligned.append(canvas)

    print(f"    frame size: {W}x{H} -> {FIXED_FRAME_W}x{H}")
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

    # ── idle: 破片除去 → 体中心揃え（拡張キャンバス）→ 個別保存
    print("  [idle frames]")
    cells_clean = [keep_body_and_nearby(c, proximity_px=20) for c in cells[:4]]
    idle_aligned = align_frames(cells_clean)
    for i, cell in enumerate(idle_aligned):
        out_path = os.path.join(OUT_DIR, f"{name}-idle-{i}.png")
        cell.save(out_path, optimize=True)
        print(f"  OK {name}-idle-{i}.png  ({FIXED_FRAME_W}x{ch}px)")

    # ── 表情フレーム（下段4コマ個別保存）
    print("  [expression frames]")
    for i, expr in enumerate(EXPRESSIONS):
        cells[4 + i].save(
            os.path.join(OUT_DIR, f"{name}-{expr}.png"), optimize=True
        )
        print(f"  OK {name}-{expr}.png")


if __name__ == "__main__":
    for name, fn in CATS.items():
        process(name, fn)

    print(f"\nDone! FIXED_FRAME_W={FIXED_FRAME_W}px")
    print(f"   -> {OUT_DIR}")
    print(f"   -> CatSprite.tsx の FRAME_NATURAL_W を {FIXED_FRAME_W} に更新してください")
