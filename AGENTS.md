# AGENTS.md — にゃんタスク プロジェクトのAIエージェント向け恒久ルール

> このファイルは Codex / Claude Code / その他AIエージェントが読み込む、プロジェクトの**恒久ルール**を記述する正本です。
> CLAUDE.md は Claude Code 専用の入口、AGENTS.md は全エージェント共通の規範。

---

## プロジェクト概要

- **プロジェクト名**：にゃんタスク（仮）
- **目的**：YouTubeコンサル生の継続課題を、猫育成ゲーム×ToDoアプリで解決
- **オーナー**：結パパ
- **状態**：active（Phase 0：技術検証着手前）
- **企画書**：`docs/PLAN.md`

## ターゲットと配布

- **Phase 1**：コンサル生10名（無料テスト、2〜3ヶ月）
- **Phase 2**：noteメンバーシップ会員（サブスク内特典）
- **Phase 3**：一般公開（任意、後日検討）

## 技術スタック（確定）

- **フロントエンド**：Next.js 14 (App Router) + Tailwind CSS + Framer Motion + next-pwa
- **バックエンド**：Supabase（Auth: Google OAuth / Postgres / Edge Functions / Vault）
- **AI**：Gemini 2.5 Flash（ユーザー側APIキー設定）
- **ホスティング**：Vercel
- **形式**：PWA（ブラウザ＋スマホ両対応、ストア登録なし）

## 編集対象とアウトオブスコープ

### AIが触っていい場所
- `app/` — Next.js アプリケーションコード
- `components/` — React コンポーネント
- `lib/` — ユーティリティ・Supabaseクライアント
- `public/` — 静的アセット（猫のSVG等）
- `docs/` — ドキュメント
- `supabase/` — マイグレーション・Edge Functions

### AIが触ってはいけない場所
- `.git/` — Git管理
- `.env*` — 環境変数（読まない・送信しない）
- `node_modules/` — 自動生成
- `.next/` — ビルド成果物
- `secrets/` — 認証情報（存在する場合）

## 命名規則

- ファイル名：英数字＋ハイフン or キャメルケース（Reactコンポーネントは PascalCase）
- 日付プレフィックス（ドキュメントのみ）：`YYYY-MM-DD-`
- 採用版には `-final` または `-v[N]` を付ける

## コーディング規約

- TypeScript 必須
- 関数コンポーネント、Hooks使用
- Server Component を優先、必要時のみ Client Component
- Supabase アクセスは `lib/supabase/` 配下のクライアント経由
- 環境変数は `.env.local`（コミット禁止）、本番は Vercel 環境変数

## 出力ルール

- 言語：日本語、です／ます調、結論先出し
- マークダウンで構造化
- コードはコピペ可能な形で出す
- 推測で断定しない、根拠が弱い箇所は明示する

## やってはいけないこと

- 確認なしの破壊的操作（削除・大量移動・上書き）
- `.env` や認証情報の外部送信
- ユーザーの Gemini APIキーを平文で扱う・ログに残す
- Supabase RLS を無効化する
- 公開済みデプロイへの予告なき push

## セキュリティ

- ユーザーAPIキーは Supabase Vault で暗号化必須
- RLS は全テーブルで有効化、本人のみ自分のデータにアクセス可
- 認証は Supabase Auth (Google OAuth) のみ、独自パスワード管理なし
- フロントから Gemini API を直接叩かず、Edge Function 経由で叩く（キー漏洩防止）

## 関連ファイル

- `CLAUDE.md` — Claude Code 用の入口
- `_PROJECT_STATE.md` — 現在の作業範囲・状態
- `.codex/config.toml` — Codex 実行環境設定
- `docs/PLAN.md` — 企画書 v4（確定版）

## 補足

このファイルはプロジェクトの「**憲法**」として機能します。AIに不適切な動作があった場合、まずこのファイルに**明文化されているか**を確認し、必要なら追記してください。
