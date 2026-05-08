"""
猫キャラクターシート処理スクリプト
  - 白背景を除去
  - 4x2グリッドを8コマに分割
    ※ 隣接セルへはみ出した尻尾をキャプチャするため CELL_PADDING=100px の余裕付きクロップ
  - 中央セル領域に最多ピクセルを持つ連結成分を主猫とし、
    その proximity_px=40px 以内の全ピクセルを保持（尻尾の細い連結部も保持）
  - 上段4コマ → idle フレームを1枚ずつ個別保存（{name}-idle-0.png 〜 -3.png）
    ※ 体の中心を全フレームで FIXED_FRAME_W//2 に揃えて横ブレを除去
    ※ 出力幅 FIXED_FRAME_W=700px（尻尾込みの余裕幅）
  - 下段4コマ → 表情フレーム（個別 PNG: happy / sparkle / sad / normal）
    ※ 同じく FIXED_FRAME_W=700px で統一
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

# 隣接セルへはみ出した尻尾をキャプチャするためのクロップ余白
CELL_PADDING = 100

# 出力キャンバス幅（体アライメント後。尻尾が収まるよう 418px より十分大きく）
# 体中心 = 350px (700//2)。尻尾が右に ~100px 伸びても 450px < 700px で収まる。
FIXED_FRAME_W = 700


def remove_white_bg(img: Image.Image, threshold: int = 240) -> Image.Image:
    """白〜明るいグレーを透明化する"""
    img = img.convert("RGBA")
    data = np.array(img, dtype=np.uint8)
    r, g, b = data[:, :, 0], data[:, :, 1], data[:, :, 2]
    white = (r >= threshold) & (g >= threshold) & (b >= threshold)
    data[white, 3] = 0
    return Image.fromarray(data)


def keep_central_cat(
    img: Image.Image,
    cell_w: int,
    left_pad: int,
    proximity_px: int = 40,
) -> Image.Image:
    """
    パディング付きでクロップされた画像から、中央セル領域（元のセル幅の範囲）に
    最も多くのピクセルを持つ連結成分を主猫として特定し、
    その proximity_px ピクセル以内の全ピクセルを保持する。

    - 隣接セルの猫（別の主体）を除去しつつ
    - 主猫の尻尾（細い連結部・孤立破片も含む）は保持できる
    """
    data = np.array(img.convert("RGBA"))
    alpha = data[:, :, 3] > 20

    labeled, n = ndlabel(alpha)
    if n == 0:
        return img

    # 中央セル領域マスク（パディングを除いた元のセル幅の範囲）
    img_w = data.shape[1]
    central_start = left_pad
    central_end   = min(left_pad + cell_w, img_w)
    central_mask  = np.zeros_like(alpha, dtype=bool)
    central_mask[:, central_start:central_end] = True

    central_alpha = alpha & central_mask
    if central_alpha.any():
        labels_in_central = labeled[central_alpha]
        counts = np.bincount(labels_in_central, minlength=n + 1)
        counts[0] = 0  # 背景ラベルは除外
        main_label = int(counts.argmax())
    else:
        # 中央にピクセルなし → 最大成分にフォールバック
        counts_all = np.bincount(labeled.ravel())
        counts_all[0] = 0
        main_label = int(counts_all.argmax())

    if main_label == 0:
        return img

    main_mask = labeled == main_label

    # 主猫成分を proximity_px 膨張させて「保持ゾーン」を作成
    struct   = np.ones((proximity_px * 2 + 1, proximity_px * 2 + 1), dtype=bool)
    near_main = binary_dilation(main_mask, structure=struct)

    keep_mask  = alpha & near_main
    removed_px = int(alpha.sum() - keep_mask.sum())
    if removed_px > 0:
        print(f"    central-cat filter: removed {removed_px}px from neighbors")

    new_data = data.copy()
    new_data[~keep_mask, 3] = 0
    return Image.fromarray(new_data)


def get_body_center_x(img: Image.Image, top_fraction: float = 0.60) -> int:
    """
    画像上部 top_fraction の透明でないピクセルの水平中心を返す。
    しっぽ（下部）を除外して体・頭の中心を取得する。
    """
    data = np.array(img.convert("RGBA"))
    h    = data.shape[0]
    top_h = int(h * top_fraction)
    alpha = data[:top_h, :, 3]
    cols  = np.where(alpha > 20)[1]
    if len(cols) == 0:
        return img.width // 2
    return int((int(cols.min()) + int(cols.max())) / 2)


def place_on_fixed_canvas(img: Image.Image, body_center_x: int) -> Image.Image:
    """
    画像を FIXED_FRAME_W 幅のキャンバスに配置し、
    body_center_x が FIXED_FRAME_W//2 になるようにシフトする。
    """
    W, H    = img.size
    target_x = FIXED_FRAME_W // 2
    paste_x  = target_x - body_center_x
    canvas   = Image.new("RGBA", (FIXED_FRAME_W, H), (0, 0, 0, 0))
    canvas.paste(img, (paste_x, 0), img)

    if paste_x < 0:
        print(f"    WARN: clips {-paste_x}px on left  (cx={body_center_x})")
    if paste_x + W > FIXED_FRAME_W:
        print(f"    WARN: clips {paste_x + W - FIXED_FRAME_W}px on right (cx={body_center_x})")

    return canvas


def align_frames(frames: list) -> list:
    """
    全フレームの体の中心X座標を FIXED_FRAME_W//2 に揃えて横ブレを除去する。
    """
    centers = [get_body_center_x(f) for f in frames]
    print(f"    body centers: {centers}  -> all -> {FIXED_FRAME_W // 2}")

    W, H = frames[0].size
    aligned = [place_on_fixed_canvas(f, cx) for f, cx in zip(frames, centers)]
    print(f"    frame size: {W}x{H} -> {FIXED_FRAME_W}x{H}")
    return aligned


def process(name: str, filename: str, cols: int = 4, rows: int = 2):
    path = os.path.join(SOURCE_DIR, filename)
    src  = Image.open(path).convert("RGBA")
    W, H = src.size
    cw, ch = W // cols, H // rows

    print(f"\n[{name}]  ({W}x{H}px  cell={cw}x{ch}  padding={CELL_PADDING}px)")

    # グリッドを分割して白抜き・主猫抽出（パディング付きクロップ）
    cells = []
    for row in range(rows):
        for col in range(cols):
            x1 = max(0, col * cw - CELL_PADDING)
            x2 = min(W, (col + 1) * cw + CELL_PADDING)
            actual_left_pad = col * cw - x1  # 端セルでは CELL_PADDING より小さい

            cell         = src.crop((x1, row * ch, x2, (row + 1) * ch))
            cell_clean   = remove_white_bg(cell)
            cell_filtered = keep_central_cat(
                cell_clean, cw, actual_left_pad, proximity_px=40
            )
            cells.append(cell_filtered)

    # ── idle: 体中心揃え（固定キャンバス）→ 個別保存
    print("  [idle frames]")
    idle_aligned = align_frames(cells[:4])
    for i, cell in enumerate(idle_aligned):
        out_path = os.path.join(OUT_DIR, f"{name}-idle-{i}.png")
        cell.save(out_path, optimize=True)
        print(f"  OK {name}-idle-{i}.png  ({FIXED_FRAME_W}x{ch}px)")

    # ── 表情フレーム（下段4コマ個別保存・同じ固定キャンバス幅で統一）
    print("  [expression frames]")
    for i, expr in enumerate(EXPRESSIONS):
        expr_frame    = cells[4 + i]
        cx            = get_body_center_x(expr_frame)
        expr_on_canvas = place_on_fixed_canvas(expr_frame, cx)
        expr_on_canvas.save(
            os.path.join(OUT_DIR, f"{name}-{expr}.png"), optimize=True
        )
        print(f"  OK {name}-{expr}.png  ({FIXED_FRAME_W}x{ch}px)")


if __name__ == "__main__":
    for name, fn in CATS.items():
        process(name, fn)

    print(f"\nDone! FIXED_FRAME_W={FIXED_FRAME_W}px  CELL_PADDING={CELL_PADDING}px")
    print(f"   -> {OUT_DIR}")
    print(f"   -> CatSprite.tsx の FRAME_NATURAL_W を {FIXED_FRAME_W} に更新してください")
