# にゃんタスク セットアップガイド

> このガイドは、結パパさんが**手動で**設定する必要があるアカウント・サービスのセットアップ手順です。
> Phase 0（技術検証）開始前に完了してください。
> 所要時間：約 30〜45分

---

## 必要なアカウント

すべて**無料枠**で開発可能です。

| サービス | 用途 | 料金 |
|---------|------|------|
| Supabase | データベース・認証・サーバーレス関数 | 無料枠（500MB DB / 50万API呼出/月） |
| Google Cloud Console | Google OAuth 2.0 クライアント発行 | 無料 |
| Vercel | ホスティング（Phase 1で必要） | 無料枠（Hobby Plan） |
| Google AI Studio | Gemini API キー（動作確認用） | 無料枠（1日数百〜数千リクエスト） |

---

## 全体の流れ

```
1. Supabase プロジェクト作成
   ↓
2. Google Cloud Console で OAuth クライアント作成
   ↓
3. Supabase に Google プロバイダー設定（1と2を繋ぐ）
   ↓
4. 取得した値を整理（後で .env.local に入れる）
   ↓
5. Gemini API キー取得（動作確認用、後でもOK）
```

---

## Step 1：Supabase プロジェクト作成

### 1-1. アカウント作成
1. https://supabase.com にアクセス
2. 右上「**Start your project**」をクリック
3. 「**Continue with GitHub**」または「Continue with Google」でサインアップ

### 1-2. 組織作成（初回のみ）
- Organization name：`yuupapa` など好きな名前
- Plan：**Free**

### 1-3. プロジェクト作成
1. ダッシュボードで「**New Project**」をクリック
2. 以下を入力：
   - **Project name**：`nyantask`
   - **Database Password**：強いパスワードを生成（**必ず記録**！後で使います）
   - **Region**：`Northeast Asia (Tokyo)` を選択（日本ユーザー向け、レイテンシ最小）
   - **Pricing Plan**：Free
3. 「**Create new project**」をクリック
4. 1〜2分待つとプロジェクト準備完了

### 1-4. 接続情報をメモ
プロジェクト画面で左サイドバー「**Settings**」→「**API**」を開き、以下を**3つメモ**してください：

```
Project URL:     https://xxxxxxxxxxxxx.supabase.co
anon public:     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（長い文字列）
service_role:    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（長い文字列、超重要）
```

⚠️ **service_role キーは絶対に公開しないでください**。フロントエンドコードに含めず、サーバーサイドのみで使います。

---

## Step 2：Google Cloud Console で OAuth クライアント作成

### 2-1. プロジェクト作成
1. https://console.cloud.google.com にアクセス（musubistore2021@gmail.com でログイン）
2. 上部のプロジェクト選択ドロップダウン →「**新しいプロジェクト**」
3. プロジェクト名：`nyantask` → 「作成」
4. 作成後、上部のプロジェクト選択で `nyantask` が選ばれていることを確認

### 2-2. OAuth 同意画面の設定
1. 左メニュー「**API とサービス**」→「**OAuth 同意画面**」
2. User Type：「**外部**」を選択 → 作成
3. アプリ情報を入力：
   - **アプリ名**：`にゃんタスク`
   - **ユーザーサポートメール**：musubistore2021@gmail.com
   - **デベロッパーの連絡先情報**：musubistore2021@gmail.com
4. 「保存して次へ」を3回クリック（スコープ・テストユーザーは後でも追加可）
5. テストユーザーには **コンサル生10名のGoogleアカウント** を後で追加すると、本番審査前でもログインできます（Phase 1まで「テストユーザー」モードで運用可能）

### 2-3. OAuth 2.0 クライアントID作成
1. 左メニュー「**API とサービス**」→「**認証情報**」
2. 上部「**+ 認証情報を作成**」→「**OAuth クライアント ID**」
3. アプリケーションの種類：「**ウェブ アプリケーション**」
4. 名前：`にゃんタスク Web Client`
5. **承認済みのリダイレクト URI** に以下を追加：
   ```
   https://[Supabase Project ID].supabase.co/auth/v1/callback
   ```
   ※ `[Supabase Project ID]` は Step 1-4 でメモした Project URL のサブドメイン部分（例：`abcdefg.supabase.co/auth/v1/callback`）
6. 「作成」をクリック

### 2-4. 認証情報をメモ
作成完了画面で以下を**2つメモ**してください：

```
クライアント ID:        xxxxxxxxx-xxxxxxxxx.apps.googleusercontent.com
クライアント シークレット: GOCSPX-xxxxxxxxxxxxxxxxxxxx
```

⚠️ クライアントシークレットも公開禁止です。

---

## Step 3：Supabase に Google プロバイダー設定

### 3-1. Authentication 設定
1. Supabase ダッシュボードに戻る
2. 左サイドバー「**Authentication**」→「**Providers**」
3. プロバイダー一覧から「**Google**」を見つけてクリック
4. 「Enable Google provider」をオンに
5. Step 2-4 でメモした値を貼り付け：
   - **Client ID (for OAuth)**：クライアント ID
   - **Client Secret (for OAuth)**：クライアントシークレット
6. **Callback URL (for OAuth)** をコピー（Step 2-3 で入れたものと一致しているか確認）
7. 「Save」をクリック

### 3-2. Site URL 設定（重要）
1. 同じ Authentication ページの「**URL Configuration**」
2. **Site URL**：開発時は `http://localhost:3000`（Phase 1で本番URLに変更）
3. **Redirect URLs**：以下を追加
   ```
   http://localhost:3000/**
   http://localhost:3000/auth/callback
   ```
4. 「Save」

---

## Step 4：取得した値を整理

ここまでで取得した値を、以下のフォーマットでまとめておいてください。
Phase 0でNext.js雛形を作るときに、`.env.local` ファイルに記入します。

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database (Supabase Settings > Database)
DATABASE_PASSWORD=Step 1-3 で設定したパスワード
```

⚠️ Google の Client ID/Secret は **Supabase 側に既に設定済み**なので、`.env.local` には不要です（ユーザーは Supabase 経由で Google ログインします）。

---

## Step 5：Gemini API キー取得（後回しOK）

ユーザーが各自で取得する想定ですが、開発時の動作確認用に結パパさんも1つ持っておくと便利です。

1. https://aistudio.google.com/apikey にアクセス（musubistore2021@gmail.com でログイン）
2. 「**Create API key**」をクリック
3. プロジェクトは `nyantask`（Step 2-1 で作ったもの）を選択
4. 表示された API キーを**メモ**：
   ```
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX
   ```

⚠️ このキーは個人用です。本番ではユーザーが各自のキーをアプリの設定画面から登録します。

### Gemini API キーの変更・ローテーション推奨タイミング

| タイミング | 対応 |
|-----------|------|
| **Phase 2 開始前**（コンサル生展開前）| Supabase Vault への移行を実施（現在は平文保存） |
| **漏洩疑いが生じたとき** | Google AI Studio で即時削除→再発行→設定画面で再登録 |
| **定期メンテ**（3〜6ヶ月ごと推奨） | Google AI Studio で利用状況を確認し、不審なリクエストがあればローテーション |

> 🔗 キーの確認・削除はこちら：https://aistudio.google.com/apikey

---

## Step 6：チェックリスト

すべて完了したら以下にチェック ✅

- [ ] Supabase プロジェクト `nyantask` 作成済み
- [ ] Supabase Project URL・anon key・service_role key をメモ済み
- [ ] Database Password をメモ済み
- [ ] Google Cloud Console プロジェクト `nyantask` 作成済み
- [ ] OAuth 同意画面 設定済み
- [ ] OAuth クライアント ID（Web）作成済み、Client ID・Secret をメモ済み
- [ ] Supabase の Google プロバイダー有効化済み
- [ ] Supabase の Site URL に `http://localhost:3000` 設定済み
- [ ] （任意）Gemini API キー取得済み

---

## トラブルシューティング

### Q. Google OAuthでログインしようとすると「リダイレクトURIが一致しません」エラーが出る
→ Google Cloud Console の **承認済みリダイレクト URI** が間違っています。
   正しい形式：`https://[your-project-id].supabase.co/auth/v1/callback`
   末尾のスラッシュ有無に注意。

### Q. Supabase の URL が分からない
→ Supabase ダッシュボード → 左サイドバー「Settings」→「API」→「Project URL」

### Q. テストユーザーじゃない人がログインできない
→ OAuth 同意画面が「テスト中」状態のため。
   Phase 2でメンバーシップ会員に展開する前に、Google の本番審査を通す必要があります。
   コンサル生10名（Phase 1）はテストユーザーに登録すればOK。

### Q. 「アプリが確認されていません」警告が出る
→ テスト中のため正常です。「詳細」→「(アプリ名)に移動（安全ではないページ）」で進めます。
   Phase 2前に Google の審査を申請して解消します。

---

## Step 7：Supabase Migration の適用（Phase 1 コード実装後）

> このステップは、Next.js 雛形作成 → コード実装（Phase 1.1 以降）が完了した後に実施してください。
> 所要時間：3〜5分

### 概要
Gemini API キー保存・Web Push 機能を有効にするため、Supabase にテーブル・カラムを追加します。
以下2つの SQL マイグレーションを手動実行します。

### 7-1. SQL Editor を開く
1. Supabase ダッシュボード左メニュー「**SQL Editor**」をクリック
2. 「**New Query**」をクリック（新規 SQL ウィンドウ作成）

### 7-2. Migration 1 を実行：Gemini API キーのカラム追加

以下の SQL をコピーして SQL Editor に貼り付けて実行（再生ボタンをクリック）：

```sql
-- ============================================================
-- にゃんタスク マイグレーション 6
-- 2026-05-03 - Gemini API キーをユーザー単位で保持
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gemini_api_key TEXT;
```

**確認：** エラーが表示されず、メッセージ「1 row」または成功表示が出れば OK ✅

### 7-3. Migration 2 を実行：Web Push 購読テーブル作成

新規 SQL クエリウィンドウで以下をコピー・実行：

```sql
-- ============================================================
-- にゃんタスク マイグレーション 7
-- 2026-05-03 - Web Push 購読情報
-- ============================================================

DROP TABLE IF EXISTS push_subscriptions CASCADE;

CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth_secret TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

CREATE INDEX idx_push_subs_user ON push_subscriptions(user_id);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_subs_select_own_or_admin" ON push_subscriptions
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "push_subs_insert_own" ON push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "push_subs_delete_own_or_admin" ON push_subscriptions
  FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- ============================================================
-- GRANT
-- ============================================================
GRANT SELECT, INSERT, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;
```

**確認：** エラーなく実行完了 ✅

### 7-4. 動作確認

dev サーバーが起動している場合、**ブラウザをリロード**（F5）してから以下を確認：

#### 確認1: Gemini API キー入力フォーム表示
1. アプリにログイン → ⚙️ 設定ページを開く
2. 「🤖 Gemini API キー」セクションが表示されていることを確認
3. テスト用の Gemini API キー（Step 5 で取得したもの）を入力してみる
4. 「保存」ボタンで保存できれば OK ✅

#### 確認2: Web Push ボタン動作確認
1. 同じ設定ページ内で「🔔 通知」セクションを確認
2. 「🔔 通知をオンにする」ボタンが表示・クリック可能であることを確認
3. クリックして通知許可を与えると、購読状態が保存される ✅

### トラブルシューティング

**Q. SQL 実行時に「テーブルまたはビューが存在しません」エラーが出る**
→ 初期マイグレーション（`20260502000000_initial.sql`）が未実行です。
   SQL Editor で実行順に他の migration も確認してください。

**Q. 権限エラー（Permission denied）が出る**
→ Supabase の `is_admin()` 関数が定義されているか確認してください。
   初期マイグレーションに GRANT 文が含まれています。

---

## 完了後のアクション

Step 6 チェックリストとこの Step 7 が完了したら、すべてのセットアップが終了です！
コンサル生への展開（Phase 2）に進めます。

---

## 関連ファイル

- 企画書：`docs/PLAN.md`
- AI向けルール：`AGENTS.md`
- 現在の作業範囲：`_PROJECT_STATE.md`
