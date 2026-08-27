# -*- coding: utf-8 -*-
import math, os, random
W = os.path.dirname(os.path.abspath(__file__))

CREAM="#FAF1E4"; BLUE="#A9C4D8"; PINK="#F4CFCB"; GOLD="#E3A857"; TEXT="#4A3E38"; WHITE="#FFFFFF"

def blob_path(cx, cy, r, seed, jitter=0.14, n=9):
    rnd = random.Random(seed)
    pts = []
    for i in range(n):
        a = 2*math.pi*i/n - math.pi/2
        rr = r*(1 + rnd.uniform(-jitter, jitter))
        pts.append((cx+rr*math.cos(a), cy+rr*math.sin(a)))
    # Catmull-Rom -> cubic Bezier (closed)
    d = f"M {pts[0][0]:.1f},{pts[0][1]:.1f} "
    for i in range(n):
        p0=pts[(i-1)%n]; p1=pts[i]; p2=pts[(i+1)%n]; p3=pts[(i+2)%n]
        c1=(p1[0]+(p2[0]-p0[0])/6, p1[1]+(p2[1]-p0[1])/6)
        c2=(p2[0]-(p3[0]-p1[0])/6, p2[1]-(p3[1]-p1[1])/6)
        d += f"C {c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f} "
    return d+"Z"

def star(x, y, s, color, op=1, rot=0):
    return (f'<g transform="translate({x},{y}) rotate({rot}) scale({s/24})" opacity="{op}">'
            f'<path d="M0,-24 C2,-8 8,-2 24,0 C8,2 2,8 0,24 C-2,8 -8,2 -24,0 C-8,-2 -2,-8 0,-24 Z" fill="{color}"/></g>')

HEAD = f'''<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8">
<link rel="stylesheet" href="fonts/fonts.css">
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:1080px;height:1080px;overflow:hidden;background:{CREAM};position:relative;
 font-family:'Zen Maru Gothic',sans-serif;color:{TEXT};-webkit-font-smoothing:antialiased}}
.dots{{position:absolute;inset:0;opacity:.05;background-image:radial-gradient(circle,{TEXT} 1.7px,transparent 1.7px);background-size:46px 46px;background-position:8px 8px}}
.tag{{position:absolute;top:64px;left:50%;transform:translateX(-50%);background:{GOLD};color:#FFF;
 font-weight:700;font-size:26px;letter-spacing:.14em;padding:12px 34px;border-radius:999px}}
.copy{{position:absolute;left:50%;transform:translateX(-50%);width:840px;text-align:center;z-index:3;background:rgba(255,255,255,.82);border-radius:28px;padding:20px 0 16px}}
.copy .l{{font-weight:900;font-size:74px;line-height:1.22;letter-spacing:.02em}}
.copy .s{{font-weight:500;font-size:27px;letter-spacing:.1em;color:#7A756C;margin-top:8px}}
.band{{position:absolute;left:70px;width:830px;border-radius:999px;color:#FFF;font-weight:700;
 text-align:center;letter-spacing:.08em;display:flex;align-items:center;justify-content:center}}
.badge{{position:absolute;right:34px;bottom:44px;width:110px;height:110px;border-radius:50%;
 background:{CREAM};border:1.5px solid {TEXT};display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:5}}
.badge .n{{font-family:'Shippori Mincho',serif;font-weight:500;font-size:24px;letter-spacing:.1em}}
.badge .m{{font-size:15px;color:{GOLD};font-weight:700;margin-top:-2px}}
.htitle{{position:absolute;top:74px;left:0;right:0;text-align:center;font-weight:900;font-size:54px;letter-spacing:.08em}}
</style></head><body>'''
FOOT = '</body></html>'

def badge():
    return '<div class="badge"><div class="n">八雲</div><div class="m">∞</div></div>'

def bands2():
    return (f'<div class="band" style="top:916px;height:60px;background:{GOLD};font-size:30px">鑑定書を郵送｜匿名配送</div>'
            f'<div class="band" style="top:990px;height:60px;background:{TEXT};font-size:30px">24〜48時間以内に発送</div>')

def bands3():
    return (f'<div class="band" style="top:872px;height:54px;background:{GOLD};font-size:27px">鑑定書を郵送｜匿名配送</div>'
            f'<div class="band" style="top:936px;height:54px;background:{TEXT};font-size:27px">24〜48時間以内に発送</div>'
            f'<div class="band" style="top:1000px;height:54px;background:{BLUE};color:{TEXT};font-size:26px">A4鑑定書3〜4枚｜3つの数字を徹底解説</div>')

# ============ 1枚目(メイン) ============
def page1(fname, tag, blob_color, hero, copy1, copy2, sub, seed, trio=False):
    if not trio:
        svg = (f'<svg style="position:absolute;inset:0;z-index:1" width="1080" height="1080" viewBox="0 0 1080 1080">'
               f'<path d="{blob_path(540,388,250,seed)}" fill="{blob_color}"/>'
               + star(310,215,17,GOLD) + star(796,268,13,GOLD,.9) + star(760,560,11,GOLD,.85)
               + f'</svg>'
               f'<div style="position:absolute;top:388px;left:540px;transform:translate(-50%,-54%);z-index:2;'
               f'font-weight:900;font-size:{360 if hero=="8" else 330}px;color:{CREAM};line-height:1">{hero}</div>')
    else:
        svg = (f'<svg style="position:absolute;inset:0;z-index:1" width="1080" height="1080" viewBox="0 0 1080 1080">'
               f'<circle cx="446" cy="322" r="150" fill="{BLUE}" opacity=".78"/>'
               f'<circle cx="634" cy="322" r="150" fill="{PINK}" opacity=".78"/>'
               f'<circle cx="540" cy="450" r="150" fill="{GOLD}" opacity=".68"/>'
               + star(276,204,15,GOLD) + star(816,230,12,GOLD,.9) + star(812,564,11,GOLD,.85) + f'</svg>'
               f'<div style="position:absolute;top:312px;left:434px;transform:translate(-50%,-50%);z-index:2;font-weight:900;font-size:120px;color:{CREAM}">1</div>'
               f'<div style="position:absolute;top:312px;left:646px;transform:translate(-50%,-50%);z-index:2;font-weight:900;font-size:120px;color:{CREAM}">2</div>'
               f'<div style="position:absolute;top:458px;left:540px;transform:translate(-50%,-50%);z-index:2;font-weight:900;font-size:120px;color:{CREAM}">3</div>')
    html = (HEAD + '<div class="dots"></div>' + f'<div class="tag">{tag}</div>' + svg
            + f'<div class="copy" style="top:{608 if trio else 650}px"><div class="l">{copy1}<br>{copy2}</div><div class="s">{sub}</div></div>'
            + (bands3() if trio else bands2()) + badge() + FOOT)
    open(f"{W}/{fname}","w").write(html)

# ============ 2枚目(鑑定書イメージ) ============
def paper(rot, x, y, w, h, z, content=""):
    return (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{w}px;height:{h}px;background:#FFF;'
            f'border:1px solid #E9E2D4;border-radius:6px;transform:rotate({rot}deg);z-index:{z};'
            f'box-shadow:0 18px 40px rgba(74,62,56,.16);display:flex;flex-direction:column;'
            f'align-items:center;justify-content:center;text-align:center">{content}</div>')

def cover_face(title):
    return (f'<div style="font-size:58px;color:{BLUE};opacity:.55;line-height:1">∞</div>'
            f'<div style="font-family:\'Shippori Mincho\',serif;font-weight:600;font-size:44px;'
            f'letter-spacing:.3em;text-indent:.3em;margin:18px 0 14px">{title}</div>'
            f'<div style="width:120px;height:2px;background:{GOLD}"></div>'
            f'<div style="font-family:\'Shippori Mincho\',serif;font-size:20px;letter-spacing:.2em;'
            f'margin-top:22px;color:#8B8894">八雲</div>')

def table_face():
    rows = ''.join(f'<div style="width:70%;height:9px;background:#EDE7DB;border-radius:5px;margin:9px 0"></div>' for _ in range(7))
    return (f'<div style="font-size:20px;font-weight:700;color:{BLUE};letter-spacing:.2em;margin-bottom:14px">1 ＋ 9 ＋ 9 ＝</div>{rows}')

def page2(fname, headline, note, detail=False):
    if not detail:
        papers = (paper(6, 380, 300, 400, 540, 1, table_face())
                + paper(-5, 240, 270, 430, 570, 2, cover_face("数秘鑑定書")))
    else:
        papers = (paper(9, 470, 320, 380, 520, 1) + paper(4.5, 400, 300, 390, 530, 2)
                + paper(-1, 330, 285, 400, 545, 3, table_face())
                + paper(-6.5, 240, 265, 430, 570, 4, cover_face("数秘鑑定書")))
        tags = ''.join(
            f'<div style="width:212px;height:52px;border-radius:999px;background:{c};color:{tc};font-weight:700;'
            f'font-size:24px;display:flex;align-items:center;justify-content:center;letter-spacing:.06em">{t}</div>'
            for t,c,tc in [("ライフパス",BLUE,TEXT),("ディスティニー",PINK,TEXT),("ソウル",GOLD,"#FFF")])
        papers += f'<div style="position:absolute;top:906px;left:50%;transform:translateX(-50%);display:flex;gap:18px;z-index:5">{tags}</div>'
    note_y = "846" if detail else "918"
    html = (HEAD + '<div class="dots"></div>'
            + f'<div style="position:absolute;top:92px;left:0;right:0;text-align:center;font-weight:700;font-size:37px;letter-spacing:.06em">{headline}</div>'
            + papers
            + f'<div style="position:absolute;top:{note_y}px;left:0;right:0;text-align:center;font-weight:500;font-size:28px;color:#7A756C;letter-spacing:.08em">{note}</div>'
            + badge() + FOOT)
    open(f"{W}/{fname}","w").write(html)

# ============ 3枚目(流れ) ============
ICONS = {
 "bag": '<path d="M-26,-12 h52 l-7,40 h-38 z" fill="none"/><path d="M-13,-12 a13,13 0 0 1 26,0" fill="none"/>',
 "bubble": '<rect x="-28" y="-24" width="56" height="38" rx="12" fill="none"/><path d="M-4,14 l-7,15 l17,-15" fill="none"/>',
 "calc": '<rect x="-22" y="-28" width="44" height="56" rx="8" fill="none"/><line x1="-12" y1="-14" x2="12" y2="-14"/><circle cx="-11" cy="2" r="3.4" stroke="none" fill="#FFF"/><circle cx="0" cy="2" r="3.4" stroke="none" fill="#FFF"/><circle cx="11" cy="2" r="3.4" stroke="none" fill="#FFF"/><circle cx="-11" cy="15" r="3.4" stroke="none" fill="#FFF"/><circle cx="0" cy="15" r="3.4" stroke="none" fill="#FFF"/><circle cx="11" cy="15" r="3.4" stroke="none" fill="#FFF"/>',
 "mail": '<rect x="-28" y="-19" width="56" height="38" rx="6" fill="none"/><path d="M-28,-17 L0,4 L28,-17" fill="none"/>',
}
def icon_circle(name, size=120):
    return (f'<svg width="{size}" height="{size}" viewBox="-60 -60 120 120" style="flex:none">'
            f'<circle cx="0" cy="0" r="58" fill="{BLUE}"/>'
            f'<g stroke="#FFF" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round">{ICONS[name]}</g></svg>')

STEPS = [("bag","① ご購入"),("bubble","② 質問フォームでヒアリング"),("calc","③ 数字を計算・鑑定"),("mail","④ 鑑定書が届く(24〜48時間以内発送)")]

def page3(fname, compare=False):
    if not compare:
        rows = ''
        for i,(ic,label) in enumerate(STEPS):
            rows += (f'<div style="display:flex;align-items:center;gap:34px">{icon_circle(ic)}'
                     f'<div style="font-weight:700;font-size:34px;letter-spacing:.04em">{label}</div></div>')
            if i < 3:
                rows += (f'<svg width="40" height="34" viewBox="0 0 40 34" style="margin-left:40px">'
                         f'<path d="M6,6 L20,24 L34,6" stroke="{GOLD}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>')
        body = (f'<div class="htitle">ご購入後の流れ</div>'
                f'<div style="position:absolute;top:196px;left:150px;display:flex;flex-direction:column;gap:16px">{rows}</div>')
    else:
        cards = ''
        for ic,label in STEPS:
            short = {"③ 数字を計算・鑑定":"③ 数字を計算"}.get(label.split("(")[0], label.split("(")[0])
            cards += (f'<div style="width:396px;height:150px;background:rgba(255,255,255,.75);border-radius:22px;'
                      f'display:flex;align-items:center;gap:20px;padding:0 24px">{icon_circle(ic,96)}'
                      f'<div style="font-weight:700;font-size:27px">{short}</div></div>')
        checks = ''
        for t in ["読む数字:1つ → 3つに","お相手の価値観・行動パターンまで掘り下げ","「これからの流れ」(今年のテーマ)の章つき"]:
            checks += (f'<div style="display:flex;align-items:center;gap:22px;margin:20px 0">'
                       f'<svg width="46" height="46" viewBox="0 0 46 46"><circle cx="23" cy="23" r="22" fill="{GOLD}"/>'
                       f'<path d="M13,24 L20,31 L33,15" stroke="#FFF" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                       f'<div style="font-weight:700;font-size:31px">{t}</div></div>')
        body = (f'<div style="position:absolute;top:64px;left:0;right:0;text-align:center;font-weight:900;font-size:46px;letter-spacing:.08em">ご購入後の流れ</div>'
                f'<div style="position:absolute;top:150px;left:118px;width:844px;display:flex;flex-wrap:wrap;gap:22px">{cards}</div>'
                f'<div style="position:absolute;top:534px;left:118px;width:844px;height:2px;background:#E0D8C8"></div>'
                f'<div style="position:absolute;top:568px;left:0;right:0;text-align:center;font-weight:900;font-size:42px;letter-spacing:.08em">入口鑑定との違い</div>'
                f'<div style="position:absolute;top:668px;left:150px">{checks}</div>')
    open(f"{W}/{fname}","w").write(HEAD + '<div class="dots"></div>' + body + badge() + FOOT)

# ============ アイコン ============
def icon_page():
    stars = star(340,318,26,GOLD,.95,12) + star(742,282,19,GOLD,.9,-8) + star(716,700,16,GOLD,.85,20)
    html = (HEAD +
        f'<svg style="position:absolute;inset:0" width="1080" height="1080" viewBox="0 0 1080 1080">{stars}</svg>'
        f'<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-56%);'
        f'font-weight:900;font-size:520px;color:{BLUE};line-height:1">∞</div>' + FOOT)
    open(f"{W}/icon.html","w").write(html)

# ============ 鑑定書背景(A4 2480x3508) ============
def art(fname, body_variant=False):
    rnd = random.Random(88 if not body_variant else 8)
    glyphs = ''
    if not body_variant:
        spots = [(190,260,'8',44,-14),(2290,420,'∞',52,10),(230,3160,'∞',48,8),(2260,3260,'8',40,16),
                 (1240,180,'✦',30,0),(320,1750,'✦',26,0),(2210,1600,'8',34,-8),(160,900,'✦',24,0),
                 (2320,2500,'✦',28,0),(1200,3360,'8',36,6),(700,300,'✦',22,0),(1800,3300,'✦',24,0)]
    else:
        spots = [(2270,330,'✦',26,0),(2330,480,'∞',40,10),(210,3230,'8',34,-10),(360,3330,'✦',22,0)]
    for x,y,g,s,r in spots:
        glyphs += (f'<div style="position:absolute;left:{x}px;top:{y}px;transform:rotate({r}deg);'
                   f'font-family:\'Zen Maru Gothic\';font-weight:700;font-size:{s*2}px;color:{BLUE};opacity:.5">{g}</div>')
    def wash(x,y,r,c,o):
        return (f'<div style="position:absolute;left:{x-r}px;top:{y-r}px;width:{2*r}px;height:{2*r}px;'
                f'border-radius:50%;background:{c};opacity:{o};filter:blur(110px)"></div>')
    if not body_variant:
        washes = wash(150,240,560,BLUE,.16)+wash(2400,3300,640,GOLD,.15)+wash(2380,300,480,PINK,.11)+wash(160,3260,460,BLUE,.10)
    else:
        washes = wash(2420,260,430,BLUE,.09)+wash(140,3320,430,GOLD,.09)
    html = (f'<!DOCTYPE html><html><head><meta charset="utf-8"><link rel="stylesheet" href="fonts/fonts.css"><style>'
            f'*{{margin:0}}body{{width:2480px;height:3508px;overflow:hidden;background:#FBF9F4;position:relative}}'
            f'</style></head><body>{washes}{glyphs}</body></html>')
    open(f"{W}/{fname}","w").write(html)

# ===== 生成 =====
page1("s1-1.html","数秘術鑑定書",BLUE,"8","数字で読む、","彼の本音。","数秘術鑑定書｜彼の気持ち",seed=41)
page1("s2-1.html","数秘術鑑定書",PINK,"∞","二人の相性を、","数字で読む。","数秘術鑑定書｜復縁",seed=77)
page1("s3-1.html","数秘術 詳細鑑定書",None,None,"3つの数字で、","じっくり鑑定。","数秘術鑑定書・詳細版｜A4 3〜4枚",seed=0,trio=True)
page2("s1-2.html","あなたと彼の数字を、丁寧に読み解きます。","A4・1〜2枚 / 印刷物を郵送")
page2("s2-2.html","お二人の数字の相性を、丁寧に読み解きます。","A4・1〜2枚 / 印刷物を郵送")
page2("s3-2.html","3つの数字で、あなたを立体的に読み解きます。","A4・3〜4枚 / 印刷物を郵送",detail=True)
page3("s1-3.html"); page3("s2-3.html"); page3("s3-3.html",compare=True)
icon_page()
art("art-cover.html"); art("art-body.html",body_variant=True)
print("generated")
