# -*- coding: utf-8 -*-
"""鑑定書の背景挿絵(A4 / 2480x3508px @300dpi)を生成する。

設計根拠は docs/mercari-uranai/assets/design-evidence.md §2.1 を参照。
- 主モチーフ:数秘の円環図(同心円+9分割の目盛+円周に数字1〜9)
- 色:くすみブルー #8A9BB0 / ゴールド #C4B28A の細線のみ
- 蓮・曼荼羅・天使・御札・数珠・封蝋・水晶・タロット図像は使わない
- 画像そのものを最終濃度で作る(テンプレ側の .bg-art は opacity:1)
"""
import math, os

W = os.path.dirname(os.path.abspath(__file__))
PW, PH = 2480, 3508          # A4 @300dpi
PAPER = "#FBF9F4"
BLUE  = "#8A9BB0"
GOLD  = "#C4B28A"


def star4(cx, cy, r, color, op):
    """四芒星(細身)。占星術の星ではなく、余白の句読点として使う。"""
    k = r * 0.24
    d = (f"M{cx},{cy-r} C{cx+k},{cy-k} {cx+k},{cy-k} {cx+r},{cy} "
         f"C{cx+k},{cy+k} {cx+k},{cy+k} {cx},{cy+r} "
         f"C{cx-k},{cy+k} {cx-k},{cy+k} {cx-r},{cy} "
         f"C{cx-k},{cy-k} {cx-k},{cy-k} {cx},{cy-r} Z")
    return f'<path d="{d}" fill="{color}" opacity="{op}"/>'


def numerology_wheel(cx, cy, r, op_line, op_num, num_size, show_numbers=True):
    """数秘の円環図。
    外円・内円の二重丸に9分割の目盛、円周上に数字1〜9。
    9は数秘術で「1桁に還元したときの最大値」であり、この分割数自体が記号になる。
    """
    g = [f'<g opacity="{op_line}">']
    g.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{BLUE}" stroke-width="2.4"/>')
    g.append(f'<circle cx="{cx}" cy="{cy}" r="{r*0.865:.1f}" fill="none" stroke="{GOLD}" stroke-width="1.6"/>')
    g.append(f'<circle cx="{cx}" cy="{cy}" r="{r*0.30:.1f}" fill="none" stroke="{BLUE}" stroke-width="1.6"/>')
    # 9分割の目盛(外円と内円のあいだの短い線)
    for i in range(9):
        a = 2 * math.pi * i / 9 - math.pi / 2
        x1, y1 = cx + r * 0.865 * math.cos(a), cy + r * 0.865 * math.sin(a)
        x2, y2 = cx + r * math.cos(a), cy + r * math.sin(a)
        g.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
                 f'stroke="{GOLD}" stroke-width="1.8"/>')
    # 内円と9点を結ぶ細線(数字どうしのつながり=相性を読む占術であることの記号)
    pts = []
    for i in range(9):
        a = 2 * math.pi * i / 9 - math.pi / 2
        pts.append((cx + r * 0.30 * math.cos(a), cy + r * 0.30 * math.sin(a)))
    for i in range(9):
        j = (i + 4) % 9          # 9点星:1つ飛ばしではなく4つ先を結ぶと一筆書きの九角星になる
        g.append(f'<line x1="{pts[i][0]:.1f}" y1="{pts[i][1]:.1f}" '
                 f'x2="{pts[j][0]:.1f}" y2="{pts[j][1]:.1f}" stroke="{BLUE}" stroke-width="1.1"/>')
    g.append('</g>')
    if show_numbers:
        for i in range(9):
            a = 2 * math.pi * i / 9 - math.pi / 2
            rr = r * 0.94
            x, y = cx + rr * math.cos(a), cy + rr * math.sin(a)
            g.append(f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="middle" dominant-baseline="central" '
                     f'font-family="Shippori Mincho, serif" font-size="{num_size}" '
                     f'fill="{BLUE}" opacity="{op_num}">{i+1}</text>')
    return "".join(g)


def corner_rule(x, y, size, flip_x, flip_y, op):
    """四隅の細い角罫。証書らしさを出す最小限の装飾。"""
    sx = -1 if flip_x else 1
    sy = -1 if flip_y else 1
    return (f'<g opacity="{op}" transform="translate({x},{y}) scale({sx},{sy})">'
            f'<path d="M0,{size} L0,0 L{size},0" fill="none" stroke="{GOLD}" stroke-width="2.2"/>'
            f'<path d="M14,{size} L14,14 L{size},14" fill="none" stroke="{GOLD}" '
            f'stroke-width="1" opacity="0.6"/></g>')


def page(fname, cover):
    parts = [f'<rect width="{PW}" height="{PH}" fill="{PAPER}"/>']

    if cover:
        # 表紙:∞マーク・タイトル・タグラインを囲む位置に円環図を置く(証書の透かしの定石)。
        # 中心は紙面のほぼ中央(y=1754)。∞・タイトル・宛名がこの円の中に収まる。
        # 表紙は数字を出さない:9分割の目盛と九角星だけにする。数字を円周に置くと
        # 必ずタイトルか署名のどちらかに接触する(9は奇数で、頂点と底点を同時に空けられない)。
        parts.append(numerology_wheel(PW / 2, 1754, 780, op_line=0.34, op_num=0.42,
                                      num_size=68, show_numbers=False))
        parts.append(corner_rule(190, 190, 120, False, False, 0.62))
        parts.append(corner_rule(PW - 190, 190, 120, True, False, 0.62))
        parts.append(corner_rule(190, PH - 190, 120, False, True, 0.62))
        parts.append(corner_rule(PW - 190, PH - 190, 120, True, True, 0.62))
        parts.append(star4(470, 800, 26, GOLD, 0.55))
        parts.append(star4(2030, 660, 20, GOLD, 0.50))
        parts.append(star4(2110, 2960, 22, GOLD, 0.46))
        parts.append(star4(400, 3080, 17, GOLD, 0.42))
    else:
        # 本文:中央は完全に無地。上下端にだけ円環の一部を覗かせる。
        parts.append(f'<g clip-path="url(#topclip)">'
                     + numerology_wheel(PW / 2, -180, 560, op_line=0.26, op_num=0.30,
                                        num_size=58, show_numbers=True) + '</g>')
        parts.append(f'<g clip-path="url(#botclip)">'
                     + numerology_wheel(PW / 2, PH + 200, 600, op_line=0.26, op_num=0.30,
                                        num_size=58, show_numbers=True) + '</g>')
        parts.append(star4(2160, 520, 18, GOLD, 0.44))
        parts.append(star4(320, PH - 560, 16, GOLD, 0.40))

    defs = (f'<defs>'
            f'<clipPath id="topclip"><rect x="0" y="0" width="{PW}" height="470"/></clipPath>'
            f'<clipPath id="botclip"><rect x="0" y="{PH-470}" width="{PW}" height="470"/></clipPath>'
            f'</defs>')

    html = (f'<!DOCTYPE html><html><head><meta charset="utf-8">'
            f'<link rel="stylesheet" href="fonts/fonts.css">'
            f'<style>*{{margin:0;padding:0}}'
            f'body{{width:{PW}px;height:{PH}px;overflow:hidden;background:{PAPER}}}</style></head><body>'
            f'<svg width="{PW}" height="{PH}" viewBox="0 0 {PW} {PH}">{defs}{"".join(parts)}</svg>'
            f'</body></html>')
    open(f"{W}/{fname}", "w").write(html)


page("art-cover.html", cover=True)
page("art-body.html", cover=False)
print("art generated")
