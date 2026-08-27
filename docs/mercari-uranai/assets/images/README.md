# 出品画像一式(生成済みPNG)

> 生成元:`../tools/gen-images.py`(HTML/SVG → ヘッドレスChromiumでPNG出力)
> 生成物はすべて**タイポグラフィ+幾何図形のみ**。AI生成イラストは一切含みません(ココナラのAI生成画像制限に抵触しないため。`ROADMAP.md` §2.5)。
> 配色・書体・レイアウトは `../thumbnail-spec.md` §0 のブランド共通仕様に準拠。

## ファイル一覧

| ファイル | 用途 | メルカリでのアップロード順 |
|---|---|---|
| `s1-1.png` | 商品①(彼の気持ち 888円)メイン | 1枚目 |
| `s1-2.png` | 商品① 鑑定書イメージ | 2枚目 |
| `s1-3.png` | 商品① ご購入後の流れ | 3枚目 |
| `s2-1.png` | 商品②(復縁)メイン | 1枚目 |
| `s2-2.png` | 商品② 鑑定書イメージ | 2枚目 |
| `s2-3.png` | 商品② ご購入後の流れ | 3枚目 |
| `s3-1.png` | 商品③(詳細鑑定 3,888円)メイン | 1枚目 |
| `s3-2.png` | 商品③ 鑑定書イメージ(3〜4枚+3つの数字) | 2枚目 |
| `s3-3.png` | 商品③ 流れ+入口鑑定との違い | 3枚目 |
| `icon.png` | プロフィールアイコン(∞マーク) | プロフィール設定用 |

すべて 1080×1080px。メルカリは**1枚目がメイン画像**として検索結果に出るため、アップロード順を守ってください。

## 再生成の手順

```bash
cd docs/mercari-uranai/assets/tools
python3 gen-images.py            # HTMLを書き出す
# 同ディレクトリに fonts/fonts.css と woff2 一式が必要
/opt/pw-browsers/chromium --headless=new --disable-gpu --no-sandbox \
  --hide-scrollbars --allow-file-access-from-files --force-device-scale-factor=1 \
  --window-size=1080,1400 --virtual-time-budget=8000 \
  --screenshot=out.png file://$PWD/s1-1.html
# ウィンドウを縦1400pxで撮り、上部1080pxを切り出す(1080指定だと最下部の帯が欠ける)
```

フォントは Google Fonts の Zen Maru Gothic(500/700/900)と Shippori Mincho(500/600)。
ローカルに woff2 を置いて `file://` 参照する構成です(実行環境からGoogle Fontsへ直接取得できないため)。

## 変更履歴

| 日付 | 内容 |
|---|---|
| 2026-08-27 | 初版(9枚+アイコン) |
