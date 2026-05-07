# _PROJECT_STATE.md — にゃんタスク 現在の作業範囲・状態

> このファイルは「**いま何をやっているか**」を宣言する一時的なドキュメントです。
> AIに作業範囲を伝えるための、その時々の指示書として使います。

---

## 現在のフェーズ

- **フェーズ**：**Phase 1.6 コード完了**（PWA + Gemini + Web Push 実装済）— 残タスク：Edge Functions cron + 細部機能
- **目標期日**：Phase 1 全体で1.5〜2ヶ月
- **状態**：active

## 今やっていること

Phase 1.2〜1.6 コード実装完了（2026-05-03）：
- **Phase 1.2**：タスクCRUD（ルーチン/デイリー）、達成率UI、おさかな付与、RLS検証済み
- **Phase 1.3**：`cats` テーブル（pattern×face×personality 12×8×10=960通り）、decay ロジック（lib/cat.ts）、feedActiveCat / unfeedActiveCat / petCat / summonNewCat、CatCard / PetCatButton / CatTalkButton / SummonNewCatButton
- **Phase 1.4**：fish + paw 二重通貨、adjustCurrency、なかよしLv UP で paw 自動付与、なでなで（paw消費）実装
- **Phase 1.5**：`/cats` 図鑑ページ（殿堂入り一覧、柄コレクション数）、lib/season.ts（春夏秋冬判定）、季節背景・バッジ、複数猫（is_active フラグで殿堂入り管理）
- **Phase 1.6**：PWA（manifest.ts + public/sw.js + ServiceWorkerRegister）、Gemini API（generateCatMessage、CatTalkButton）、Web Push（saveSubscription / broadcastNotification / sendTestNotification）、設定画面（APIキー + Push購読）

**残タスク（コード未実装）：**
1. Supabase Edge Functions cron（時間減衰・ステージ進行の定期実行）※ 現状は ホームアクセス時に lazy eval で代替中
2. ~~レア報酬枠~~ ✅ 実装済み（2026-05-06）
3. ~~ストリークボーナス~~ ✅ 実装済み（2026-05-06）
4. ~~猫の名前変更 UI~~ ✅ 実装済み（2026-05-06）
5. 管理画面でのブロードキャスト通知 UI

**Supabase に未適用の可能性がある migration：**
- `20260503040000_gemini_apikey.sql`（profiles.gemini_api_key カラム追加）
- `20260503050000_push_subscriptions.sql`（push_subscriptions テーブル）
→ SupabaseダッシュボードのSQL Editorで手動実行が必要

## 今回の作業範囲（IN）

- ✅ プロジェクトフォルダ作成（`2026-05_nyantask/`）
- ✅ 企画書 v6 を `docs/PLAN.md` に保存（管理画面・RBAC・招待フロー追加）
- ✅ セットアップガイド `docs/SETUP_GUIDE.md` 作成
- ✅ **【結パパ手動】** Supabase プロジェクト作成
- ✅ **【結パパ手動】** Google Cloud Console で OAuth クライアント作成
- ✅ **【結パパ手動】** Supabase に Google プロバイダー設定 + URL Configuration
- ✅ Next.js 14 雛形作成（package.json / tsconfig / app/ / lib/supabase/ / middleware.ts）
- ✅ 初期マイグレーションSQL作成（profiles / invitations + トリガー + RLS）
- ✅ **【結パパ手動】** `npm install` 実行（Claude側で実施）
- ✅ **【結パパ手動】** `.env.local` 作成（Supabase接続情報）
- ✅ **【結パパ手動】** Supabase SQL Editor でマイグレーション実行
- ✅ **【結パパ手動】** GRANT 文で authenticated ロール権限付与（マイグレーションSQLの不備を補正）
- ✅ **【結パパ手動】** profilesに自分のレコード手動INSERT（マイグレーション前にログインしていたため）
- ✅ **【結パパ手動】** UPDATE で admin ロール昇格
- ✅ Phase 0：`npm run dev` 起動 → **Google OAuth 疎通テスト完了**

## Phase 1 残作業

- ✅ middleware.ts → proxy.ts に変更（1.1で実施）
- ✅ lockfile 警告対処（1.1で turbopack.root 設定）
- ✅ 管理画面の骨組み（1.1）
- ✅ Phase 1.2：タスクCRUD＆通貨システム
- ✅ Phase 1.3：猫育成（catsテーブル、状態遷移ロジック、絵文字プレースホルダ）
- ✅ Phase 1.4：通貨システム拡張（fish+paw、なかよしLv UP報酬、なでなで）
- ✅ Phase 1.5：図鑑・季節・複数猫（/catsページ、season.ts、殿堂入り管理）
- ✅ Phase 1.6：PWA化（manifest+sw.js）、Gemini API連携（猫トーク）、Web Push通知
- ✅ **pg_cron 時間減衰**（毎時0分に decay_all_active_cats() を自動実行。lazy eval との二重構成）
- ✅ **レア報酬枠**（15% で +5🐟、さらに 4.5% で +1🐾、ポップアップ通知付き）
- ✅ **ストリークボーナス**（7日連続 → paw +5、重複防止付き）
- ✅ **猫の名前変更 UI**（CatCard にインライン編集、Enter/Escape 対応）
- ⬜ **Supabase migration 手動適用**（gemini_apikey + push_subscriptions）

## 今回はやらないこと（OUT）

- ❌ MVP本実装（Phase 1で着手）
- ❌ 猫の本格デザイン（Phase 0は仮素材）
- ❌ 配布・テスト運用（Phase 2で着手）
- ❌ ストア登録（PWA採用のため不要）

## 触っていいファイル

- `docs/*` — ドキュメント全般
- `app/`, `components/`, `lib/` — Next.js作成後
- `supabase/` — マイグレーション

## 触らないでほしいファイル

- `.env*` — 環境変数（手動設定）
- `.git/`
- `node_modules/`, `.next/` — 自動生成

## 直近の判断・決定事項

- 2026-05-06：**Phase 1.6 コード完了を確認**。コード実態と `_PROJECT_STATE.md` の乖離を修正（Phase 1.2〜1.6 すべてコード実装済みが判明）。残タスクは Edge Functions / レア報酬枠 / ストリークボーナス / 猫名変更UI / Supabase未適用 migration 2本。
- 2026-05-06：**Phase 1.2 完了**。タスクCRUD（ルーチン/デイリー分離）、通貨システム（おさかな + パーフェクトボーナス）、猫との連携（feedActiveCat/unfeedActiveCat）、達成率UI、RLS多ユーザー検証まで完了
- 2026-05-03：**Phase 1.1 完了**。管理画面（layout/dashboard/users/invitations）、ロール変更機能、UI日本語化、Server-only モジュール分離まで完了。各セッション終わりにTypeScript/ESLint/dev動作確認のチェック工程を必ず踏むルールを採用
- 2026-05-03：**Phase 0 完了**。Google OAuth ログイン → profiles 自動作成 → admin ロール表示まで動作確認済み
- 2026-05-03：マイグレーションSQLに GRANT 文を追加（Supabase で SQL DDL するときは authenticated ロールへの明示的 GRANT が必要）
- 2026-05-03：Next.js を 14.2.18 → **16.2.4** にアップグレード（セキュリティパッチ + `await cookies()` 対応）。React 18 → 19 に統一
- 2026-05-02：**企画v6に更新**。管理画面（admin/consultant_student/member/general 4ロール）、コードレス招待フロー（事前メアド登録方式）を追加
- 2026-05-02：Next.js 14 雛形作成完了。Supabase Auth (@supabase/ssr) + Google OAuth + RLS の構成
- 2026-05-02：企画v4確定。PWA + Google OAuth + Gemini APIユーザー設定の方針で確定
- 2026-05-02：プラットフォームはネイティブアプリではなくPWAに決定（ストア登録不要、開発期間短縮）
- 2026-05-02：招待コード制を廃止、Googleログインのみで利用可
- 2026-05-02：Phase 1はコンサル生10名で無料テスト、Phase 2でnoteメンバーシップ会員に展開
- 2026-05-02：**企画v5に更新**。モックアップを受けて以下追加：
  - 通貨2種（🐟おさかな=日常、🐾にくきゅう=プレミアム）
  - なかよしLv.（成長ステージとは別軸の親密度、無限拡張）
  - レア報酬枠（タスク完了時の確率出現）+ にくきゅう召喚
  - ナビゲーションは柔軟構造（後から追加・変更可能）
- 2026-05-02：**アプリ名表記確定**：日本語名「にゃんタスク」、英字ロゴ「NyanTask」（併用）
- 2026-05-02：Phase 0 進め方は A案（先にセットアップガイド→結パパ手動設定→雛形作成）を採用

## ブロッカー・要相談

（現時点でブロッカーなし）

## Gemini API キーの管理に関する注意事項

現在のキーは **Supabase DB に平文保存（MVP仕様）**。以下のタイミングで対応が必要：

| タイミング | 対応内容 |
|-----------|---------|
| **Phase 2 開始前**（コンサル生10名に展開する前）| Supabase Vault へ移行。平文保存では管理者がキーを参照できる状態のため |
| **キーの漏洩疑いが生じたとき** | [Google AI Studio](https://aistudio.google.com/apikey) で該当キーを即時削除・再発行。設定画面から新しいキーを再登録 |
| **定期メンテナンス時**（推奨：3〜6ヶ月ごと） | Google AI Studio で利用状況を確認。見覚えのないリクエストがあればキーをローテーション |
| **コンサル生のアカウント退会時** | 当該ユーザーのキーは RLS で自動削除されるが、念のため Google AI Studio 側でも使用状況を確認 |

## 次のアクション

優先度順：

1. ✅ **【完了】Supabase migration 適用**（2026-05-07 実施済み）
2. ✅ **【完了】管理画面ブロードキャスト通知 UI**（2026-05-07 実装済み）
3. **動作確認・テスト運用**（Phase 2 準備：コンサル生10名への展開）
4. ✅ **【完了】pg_cron 時間減衰**（2026-05-07 実施済み）
5. ✅ **【完了】Gemini API キーの Supabase Vault 移行**（2026-05-07 実施済み）
6. ✅ **【完了】ショップ機能 + コイン移行**（2026-05-07 実施済み）
   - 🐟おさかな → 🪙コイン（DB・コード・UI 全体リネーム）
   - 餌3種（ふつうのエサ/プレミアムフード/特選まぐろ）
   - おもちゃ3種（ねこじゃらし/まりボール/またたびクッション）
   - `/shop` ページ + 持ち物管理

---

更新日：2026-05-07（Migration 適用完了・ブロードキャスト通知 UI 実装完了・Gemini キー管理注意事項追記）
