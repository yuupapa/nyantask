"""
Canva 製ログインモックアップ SVG から、埋め込み PNG 画像と座標情報を抽出。
- 各 <image> 要素の base64 PNG を public/login-svg/img-NN.png に保存
- 座標・サイズ・transform を JSON で出力

使用例:
  python scripts/extract_login_svg_assets.py
"""

import base64
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

SVG_PATH = Path(r"C:\Users\szi7k\Downloads\名称未設定のデザイン (1).svg")
OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "login-svg"
INFO_OUT = Path(__file__).resolve().parent.parent / "app" / "login" / "_assets.json"

NS = {
    "svg": "http://www.w3.org/2000/svg",
    "xlink": "http://www.w3.org/1999/xlink",
}


def parse_transform(t: str) -> dict:
    """translate(x y) や matrix(...) を控えめに解析"""
    out = {"raw": t or ""}
    if not t:
        return out
    m = re.search(r"translate\(\s*([-\d.]+)\s*[ ,]\s*([-\d.]+)?\s*\)", t)
    if m:
        out["tx"] = float(m.group(1))
        out["ty"] = float(m.group(2)) if m.group(2) else 0.0
    m2 = re.search(r"matrix\(([^)]+)\)", t)
    if m2:
        nums = [float(x) for x in re.split(r"[ ,]+", m2.group(1).strip())]
        if len(nums) == 6:
            out["matrix"] = nums
    return out


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Reading {SVG_PATH}")
    tree = ET.parse(SVG_PATH)
    root = tree.getroot()

    # SVG ルートの viewBox / width / height
    vb = root.attrib.get("viewBox", "")
    w = root.attrib.get("width", "")
    h = root.attrib.get("height", "")
    print(f"viewBox={vb} width={w} height={h}")

    # 画像要素をすべて取得
    images = []
    for idx, img in enumerate(root.iter("{http://www.w3.org/2000/svg}image")):
        href = img.attrib.get("{http://www.w3.org/1999/xlink}href") or img.attrib.get("href") or ""
        if not href.startswith("data:image/png;base64,"):
            print(f"  skip non-png at {idx}")
            continue

        b64 = href.split(",", 1)[1]
        data = base64.b64decode(b64)

        x = float(img.attrib.get("x", "0") or "0")
        y = float(img.attrib.get("y", "0") or "0")
        w_attr = float(img.attrib.get("width", "0") or "0")
        h_attr = float(img.attrib.get("height", "0") or "0")

        # transform は親 g 要素にもあるので登っていく
        # （ET だと parent 取れないので preserveAspectRatio の transform は image 自身のみ参照）
        own_transform = parse_transform(img.attrib.get("transform", ""))

        out_path = OUT_DIR / f"img-{idx:02d}.png"
        with out_path.open("wb") as f:
            f.write(data)

        # PNG の実寸を読む（ヘッダ判定）
        png_w = int.from_bytes(data[16:20], "big")
        png_h = int.from_bytes(data[20:24], "big")

        images.append({
            "idx": idx,
            "file": f"/login-svg/img-{idx:02d}.png",
            "x": x,
            "y": y,
            "width": w_attr,
            "height": h_attr,
            "transform": own_transform,
            "png_w": png_w,
            "png_h": png_h,
            "bytes": len(data),
        })
        print(f"  [{idx:02d}] x={x:.0f} y={y:.0f} w={w_attr:.0f} h={h_attr:.0f}  png={png_w}x{png_h}  ({len(data)} bytes)")

    # 親 g の transform もたどるバージョン（XPath 的に手動）
    # Canva の SVG では <g transform="translate(...)"> の中に <image> がある可能性が高い
    # ここでは ET 第二パスで親子関係を辿る
    parent_map = {c: p for p in tree.iter() for c in p}

    def gather_transforms(node):
        # ルートまで遡って transform を全部集める（外側→内側の順）
        chain = []
        cur = node
        while cur is not None:
            t = cur.attrib.get("transform", "")
            if t:
                chain.append(t)
            cur = parent_map.get(cur)
        return list(reversed(chain))

    # 画像ごとに親チェーンの transform もメタに加える
    for idx, img in enumerate(root.iter("{http://www.w3.org/2000/svg}image")):
        if idx >= len(images):
            break
        chain = gather_transforms(img)
        images[idx]["transform_chain"] = chain

    info = {
        "viewBox": vb,
        "width": w,
        "height": h,
        "images": images,
    }
    INFO_OUT.write_text(json.dumps(info, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nWrote {len(images)} images to {OUT_DIR}")
    print(f"Wrote metadata to {INFO_OUT}")


if __name__ == "__main__":
    main()
