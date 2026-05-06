-- ============================================================
-- にゃんタスク マイグレーション 5
-- 2026-05-03 - 通貨システム（おさかな🐟・にくきゅう🐾）
--
-- 設計:
--   - profiles に fish / paw カラムを追加（残高）
--   - currency_transactions テーブルに履歴を保持（増減の理由・タイミング）
--   - 残高は profiles で簡単に参照、履歴は監査・不正検知・将来の集計に
-- ============================================================

-- profiles に通貨残高カラムを追加（既に存在していてもエラーにならないように）
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fish INTEGER NOT NULL DEFAULT 0 CHECK (fish >= 0);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS paw INTEGER NOT NULL DEFAULT 0 CHECK (paw >= 0);

-- 通貨種別
DROP TYPE IF EXISTS currency_kind CASCADE;
CREATE TYPE currency_kind AS ENUM ('fish', 'paw');

-- 増減の理由
DROP TYPE IF EXISTS currency_reason CASCADE;
CREATE TYPE currency_reason AS ENUM (
  'task_complete',         -- タスク完了
  'task_uncomplete',       -- タスク完了取り消し（マイナス）
  'daily_perfect_bonus',   -- 達成率100%ボーナス
  'friendship_levelup',    -- なかよしLv UP
  'streak_bonus',          -- 連続達成ボーナス
  'secret_cat',            -- シークレット猫発見
  'admin_grant',           -- 管理者付与
  'spend_summon',          -- にくきゅうで召喚
  'other'
);

-- ============================================================
-- 履歴テーブル
-- ============================================================
DROP TABLE IF EXISTS currency_transactions CASCADE;
CREATE TABLE currency_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind currency_kind NOT NULL,
  amount INTEGER NOT NULL,             -- 正：増加、負：減少
  reason currency_reason NOT NULL,
  related_id UUID,                     -- task_id、cat_id 等の関連ID（あれば）
  note TEXT,                           -- 任意のメモ
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_currency_tx_user_created ON currency_transactions(user_id, created_at DESC);
CREATE INDEX idx_currency_tx_kind ON currency_transactions(user_id, kind, created_at DESC);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE currency_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "currency_tx_select_own_or_admin" ON currency_transactions
  FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "currency_tx_insert_own" ON currency_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
-- update / delete は基本許可しない（履歴の改竄防止）

-- ============================================================
-- GRANT
-- ============================================================
GRANT SELECT, INSERT ON public.currency_transactions TO authenticated;
GRANT ALL ON public.currency_transactions TO service_role;
