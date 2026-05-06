# にゃんタスク

> ToDoしながら、ねこ集め！
> YouTubeコンサル生向け、猫育成ゲーム×ToDoアプリ（PWA）

## ドキュメント

- 企画書：[docs/PLAN.md](./docs/PLAN.md)
- セットアップ：[docs/SETUP_GUIDE.md](./docs/SETUP_GUIDE.md)
- 現在の作業範囲：[_PROJECT_STATE.md](./_PROJECT_STATE.md)
- AI向けルール：[AGENTS.md](./AGENTS.md)

## 開発の始め方

```bash
# 依存インストール
npm install

# 環境変数ファイルを作成（secrets/keys-memo.md の値を貼り付け）
cp .env.example .env.local

# 開発サーバー起動
npm run dev
# → http://localhost:3000
```

## 技術スタック

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase (Auth: Google OAuth / Postgres / Edge Functions)
- Gemini 2.5 Flash（ユーザー側APIキー）
- Vercel ホスティング

## ディレクトリ構成

```
2026-05_nyantask/
├── app/                  # Next.js App Router
│   ├── auth/             # 認証ルート（callback / signout）
│   ├── login/            # ログイン画面
│   ├── layout.tsx        # ルートレイアウト
│   ├── page.tsx          # ホーム画面
│   └── globals.css
├── lib/
│   └── supabase/         # Supabase クライアント
├── supabase/
│   └── migrations/       # DBマイグレーション
├── docs/                 # 企画書・セットアップガイド
├── secrets/              # 接続情報メモ（gitignore済）
├── middleware.ts         # 認証セッション管理
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
└── postcss.config.mjs
```

## ライセンス

Proprietary（結パパ）。商用利用前に要相談。
