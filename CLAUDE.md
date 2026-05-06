# CLAUDE.md — にゃんタスク Claude Code 用入口

> このファイルは Claude Code がプロジェクト起動時に読み込みます。
> 詳細ルールは `AGENTS.md` を参照してください。

## このプロジェクトの目的

YouTubeコンサル生の継続課題を、**猫育成ゲーム×ToDoアプリ（PWA）**で解決する。
詳細は `docs/PLAN.md` を参照。

## 進め方

- 複雑な実装・デバッグ・レビューは **Codex** を優先する（`/codex:rescue`）
- Web検索・ログ解析・高速パイプ処理は **Gemini CLI** を優先する
- 全体設計・判断・統合は **Claude Code** が担当する

### Gemini CLI 呼び出し

```bash
export GEMINI_API_KEY="$(powershell -Command "[System.Environment]::GetEnvironmentVariable('GEMINI_API_KEY', 'User')")" && gemini -p "プロンプト"
```

## 技術スタック

- Next.js 14 (App Router) + Tailwind CSS + Framer Motion + next-pwa
- Supabase（Auth/DB/Edge Functions/Vault）
- Gemini 2.5 Flash（ユーザー側APIキー）
- Vercel

## 出力ルール

- 言語：日本語、です／ます調、結論先出し
- マークダウン構造化
- 結論 → 根拠 → 示唆 → 次アクションの順
- コードはコピペ可能な形で出す

## 編集ルール

- 詳細は `AGENTS.md` を参照
- 現在の作業範囲は `_PROJECT_STATE.md` を参照
- 企画書は `docs/PLAN.md` を参照

## やらないこと

- 確認なしの破壊的変更
- `.env` や認証情報の外部送信
- 勝手にファイル削除や大量移動
- Gemini APIキーの平文保存・ログ出力

## 関連リンク

- 企画書：`docs/PLAN.md`
- 知識ベース：`G:\共有ドライブ\YuuPapa-Wiki\`
- グローバル設定：`C:\Users\szi7k\.claude\CLAUDE.md`
