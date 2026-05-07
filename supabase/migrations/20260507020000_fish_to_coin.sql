-- ============================================================
-- にゃんタスク マイグレーション 9
-- 2026-05-07 - 通貨名称変更: fish（🐟おさかな）→ coin（🪙コイン）
--
-- 変更内容：
--   1. profiles.fish カラムを coin にリネーム
--   2. currency_kind ENUM の 'fish' 値を 'coin' にリネーム
--      （既存の currency_transactions レコードも自動的に更新される）
-- ============================================================

-- 1. profiles カラムのリネーム
ALTER TABLE profiles RENAME COLUMN fish TO coin;

-- 2. ENUM 値のリネーム（PostgreSQL 10+ 対応）
ALTER TYPE currency_kind RENAME VALUE 'fish' TO 'coin';
