"""
猫100匹 品質チェックスクリプト
  - PNG(RGBA) のサイズ、透明度、端の描画、重複を検査
  - 出力: scripts/cat-quality-report.md
  - 実行: python scripts/check_cat_quality.py
"""

from __future__ import annotations

import datetime as dt
import hashlib
import os
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image

PROJECT = Path(__file__).resolve().parents[1]
CATS_DIR = PROJECT / "public" / "cats"
REPORT_PATH = PROJECT / "scripts" / "cat-quality-report.md"

EXPECTED_W = 1254
EXPECTED_H = 1254
TOTAL = 100
VISIBLE_ALPHA = 16
BACKGROUND_OPAQUE_RATIO = 0.95
NEAR_DUPLICATE_HAMMING = 2


@dataclass(frozen=True)
class CatStats:
    fname: str
    width: int
    height: int
    bit_depth: int
    color_type: int
    file_size: int
    opaque_ratio: float
    edge_visible_pixels: int
    bbox: tuple[int, int, int, int] | None
    margins: tuple[int, int, int, int] | None
    sha256: str
    fingerprint: int | None


def read_png_header(path: Path) -> tuple[int, int, int, int]:
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError("PNG signature が不正")

    # PNG signature の直後は IHDR 固定。
    if data[12:16] != b"IHDR":
        raise ValueError("IHDR が見つからない")
    width, height, bit_depth, color_type, _, _, _ = np.frombuffer(
        data[16:29], dtype=">u4", count=2
    ).tolist() + list(data[24:29])
    return int(width), int(height), int(bit_depth), int(color_type)


def dhash(data: np.ndarray, visible: np.ndarray) -> int | None:
    if not visible.any():
        return None

    ys, xs = np.nonzero(visible)
    y0, y1 = int(ys.min()), int(ys.max())
    x0, x1 = int(xs.min()), int(xs.max())
    sample_y = np.linspace(y0, y1, 8).astype(np.int64)
    sample_x = np.linspace(x0, x1, 9).astype(np.int64)
    samples = data[sample_y[:, None], sample_x[None, :], :].astype(np.float32)

    alpha = samples[:, :, 3] / 255.0
    # 透明部分は白地に合成して、背景透過の差を重複判定に混ぜない。
    luma = (
        0.2126 * samples[:, :, 0]
        + 0.7152 * samples[:, :, 1]
        + 0.0722 * samples[:, :, 2]
    )
    luma = luma * alpha + 255.0 * (1.0 - alpha)
    bits = luma[:, :-1] > luma[:, 1:]

    value = 0
    for bit in bits.flatten():
        value = (value << 1) | int(bit)
    return value


def analyze_cat(path: Path) -> CatStats:
    width, height, bit_depth, color_type = read_png_header(path)
    with Image.open(path) as image:
        data = np.array(image.convert("RGBA"), dtype=np.uint8)

    height, width = data.shape[:2]
    alpha = data[:, :, 3]
    visible = alpha > VISIBLE_ALPHA
    visible_count = int(visible.sum())
    total = width * height
    opaque_ratio = visible_count / total

    edge_visible = int(visible[0, :].sum() + visible[-1, :].sum())
    if height > 2:
        edge_visible += int(visible[1:-1, 0].sum() + visible[1:-1, -1].sum())

    bbox: tuple[int, int, int, int] | None = None
    margins: tuple[int, int, int, int] | None = None
    if visible_count:
        ys, xs = np.nonzero(visible)
        x0, x1 = int(xs.min()), int(xs.max())
        y0, y1 = int(ys.min()), int(ys.max())
        bbox = (x0, y0, x1, y1)
        margins = (x0, y0, width - 1 - x1, height - 1 - y1)

    content = path.read_bytes()
    return CatStats(
        fname=path.name,
        width=width,
        height=height,
        bit_depth=bit_depth,
        color_type=color_type,
        file_size=len(content),
        opaque_ratio=opaque_ratio,
        edge_visible_pixels=edge_visible,
        bbox=bbox,
        margins=margins,
        sha256=hashlib.sha256(content).hexdigest(),
        fingerprint=dhash(data, visible),
    )


def hamming(a: int, b: int) -> int:
    return (a ^ b).bit_count()


def main() -> None:
    errors: list[str] = []
    warnings: list[str] = []
    stats: list[CatStats] = []

    for n in range(1, TOTAL + 1):
        fname = f"cat-{n:03d}.png"
        path = CATS_DIR / fname

        if not path.exists():
            errors.append(f"**{fname}**: ファイルが存在しない")
            continue

        try:
            cat = analyze_cat(path)
        except Exception as exc:
            errors.append(f"**{fname}**: PNG解析失敗 ({exc})")
            continue

        stats.append(cat)

        if cat.width != EXPECTED_W or cat.height != EXPECTED_H:
            errors.append(
                f"**{fname}**: サイズ異常 {cat.width}x{cat.height}px"
                f"（期待: {EXPECTED_W}x{EXPECTED_H}）"
            )
        if cat.opaque_ratio > BACKGROUND_OPAQUE_RATIO:
            warnings.append(
                f"**{fname}**: 背景が残っている可能性"
                f"（不透明率 {cat.opaque_ratio:.1%}）"
            )
        if cat.edge_visible_pixels > 0:
            warnings.append(
                f"**{fname}**: 画像端に描画が接している"
                f"（端の可視ピクセル {cat.edge_visible_pixels:,}）"
            )

    exact_duplicate_groups: list[list[str]] = []
    seen_hashes: dict[str, list[str]] = {}
    for cat in stats:
        seen_hashes.setdefault(cat.sha256, []).append(cat.fname)
    for group in seen_hashes.values():
        if len(group) > 1:
            exact_duplicate_groups.append(group)

    near_duplicates: list[tuple[str, str, int]] = []
    with_hash = [cat for cat in stats if cat.fingerprint is not None]
    for i, left in enumerate(with_hash):
        for right in with_hash[i + 1 :]:
            distance = hamming(left.fingerprint or 0, right.fingerprint or 0)
            if distance <= NEAR_DUPLICATE_HAMMING:
                near_duplicates.append((left.fname, right.fname, distance))

    lines = [
        "# 猫100匹 品質チェックレポート",
        "",
        f"チェック日時: {dt.datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "対象: `public/cats/cat-001.png` 〜 `cat-100.png`",
        "検査方法: PNGヘッダ、RGBA透明度、端の描画、SHA-256完全一致、dHash近似一致",
        "",
        "---",
        "",
        "## 自動検出エラー",
        "",
    ]
    lines.extend([f"- {issue}" for issue in errors] or ["- なし"])

    lines += [
        "",
        "## 自動検出警告",
        "",
    ]
    lines.extend([f"- {warning}" for warning in warnings] or ["- なし"])

    lines += [
        "",
        "## 重複チェック",
        "",
    ]
    if exact_duplicate_groups:
        lines.append("### 完全一致")
        for group in exact_duplicate_groups:
            lines.append(f"- {', '.join(group)}")
    else:
        lines.append("- 完全一致: なし")

    if near_duplicates:
        lines.append("")
        lines.append(f"### 近似一致候補（dHash距離 <= {NEAR_DUPLICATE_HAMMING}）")
        for left, right, distance in near_duplicates:
            lines.append(f"- {left} / {right}: distance {distance}")
    else:
        lines.append(f"- 近似一致候補（dHash距離 <= {NEAR_DUPLICATE_HAMMING}）: なし")

    if stats:
        sizes = [cat.file_size for cat in stats]
        ratios = [cat.opaque_ratio for cat in stats]
        lines += [
            "",
            "## ファイル統計",
            "",
            f"- 検出枚数: {len(stats)} / {TOTAL}",
            f"- サイズ: {EXPECTED_W}x{EXPECTED_H}px 期待",
            f"- 平均ファイルサイズ: {sum(sizes) / len(sizes) / 1024:.0f} KB",
            f"- 最小ファイルサイズ: {min(sizes) / 1024:.0f} KB",
            f"- 最大ファイルサイズ: {max(sizes) / 1024:.0f} KB",
            f"- 平均不透明率: {sum(ratios) / len(ratios):.1%}",
            f"- 最小不透明率: {min(ratios):.1%}",
            f"- 最大不透明率: {max(ratios):.1%}",
        ]

    lines += [
        "",
        "---",
        "",
        "## 目視チェック結果",
        "",
        "接触シートで100枚を確認し、ここに結果を追記する。",
        "",
        "| 画像番号 | 問題内容 | 重大度 |",
        "|---------|---------|--------|",
        "| 未実施 | — | — |",
        "",
        "---",
        "",
        "## 総評",
        "",
        f"自動検出エラー: {len(errors)} 件 / 警告: {len(warnings)} 件",
        "",
        "目視確認後に実装可否を追記する。",
    ]

    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"レポート出力: {REPORT_PATH}")
    print(f"自動検出エラー: {len(errors)} 件")
    print(f"自動検出警告: {len(warnings)} 件")
    print(f"完全一致重複: {len(exact_duplicate_groups)} グループ")
    print(f"近似一致候補: {len(near_duplicates)} 件")


if __name__ == "__main__":
    main()
