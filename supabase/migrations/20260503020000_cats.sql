-- ============================================================
-- にゃんタスク マイグレーション 4
-- 2026-05-03 - 猫育成（最小スコープ）
--
-- 設計:
--   - 1ユーザー1匹の active 猫（複数育成は将来対応）
--   - 個性: pattern（柄）× face（顔）× personality（性格）の組み合わせ
--   - 状態: hunger（満腹度）/ mood（機嫌）/ friendship_xp（なかよし経験値）
--   - 時間減衰はサーバー読み取り時に計算（last_decay_at から経過時間）
--   - 家出判定はクライアント側で実装予定（Phase 1.3 では未実装）
-- ============================================================

-- 再実行可能にするためクリーンアップ
DROP TABLE IF EXISTS cats CASCADE;

-- ============================================================
-- cats テーブル
-- ============================================================
CREATE TABLE cats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 名前と個性
  name TEXT NOT NULL DEFAULT 'にゃんこ' CHECK (length(name) > 0 AND length(name) <= 20),
  pattern TEXT NOT NULL,        -- 柄: mike / kuro / shiro / ... 12種
  face TEXT NOT NULL,           -- 顔: round / sharp / ... 8種
  personality TEXT NOT NULL,    -- 性格: ottori / tsundere / ... 10種
  rarity SMALLINT NOT NULL DEFAULT 1 CHECK (rarity BETWEEN 1 AND 5),

  -- 状態
  hunger SMALLINT NOT NULL DEFAULT 70 CHECK (hunger BETWEEN 0 AND 100),
  mood SMALLINT NOT NULL DEFAULT 70 CHECK (mood BETWEEN 0 AND 100),
  friendship_xp INTEGER NOT NULL DEFAULT 0 CHECK (friendship_xp >= 0),

  -- フラグ
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_runaway BOOLEAN NOT NULL DEFAULT false,

  -- 時刻
  born_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_decay_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1ユーザー1匹の活動中の猫（Phase 1.3 制約）
CREATE UNIQUE INDEX idx_cats_user_active ON cats(user_id) WHERE is_active = true;
CREATE INDEX idx_cats_user ON cats(user_id);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE cats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cats_select_own_or_admin" ON cats
  FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "cats_insert_own" ON cats
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cats_update_own" ON cats
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cats_delete_own" ON cats
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- GRANT
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cats TO authenticated;
GRANT ALL ON public.cats TO service_role;
