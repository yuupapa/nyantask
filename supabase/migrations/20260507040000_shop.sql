-- ============================================================
-- にゃんタスク マイグレーション 11
-- 2026-05-07 - ショップ機能（商品マスタ + ユーザー所持品）
-- ============================================================

-- 1. 商品マスタ
CREATE TABLE shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('food', 'furniture', 'toy')),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price INT NOT NULL CHECK (price > 0),
  effect_type TEXT CHECK (effect_type IN ('hunger', 'mood', 'xp')),
  effect_value INT NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. ユーザー所持品
CREATE TABLE user_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES shop_items(id),
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id)
);

CREATE INDEX idx_user_items_user ON user_items(user_id);

-- 3. RLS
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_items ENABLE ROW LEVEL SECURITY;

-- shop_items: 全員閲覧可
CREATE POLICY "shop_items_select_all" ON shop_items
  FOR SELECT USING (true);

-- user_items: 本人のみ
CREATE POLICY "user_items_select_own" ON user_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_items_insert_own" ON user_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_items_update_own" ON user_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_items_delete_own" ON user_items
  FOR DELETE USING (auth.uid() = user_id);

-- 4. GRANT
GRANT SELECT ON shop_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_items TO authenticated;

-- 5. 初期商品データ
INSERT INTO shop_items (category, slug, name, description, price, effect_type, effect_value, sort_order) VALUES
  ('food', 'food-basic',   'ふつうのエサ',       'カリカリの定番ごはん',           3,  'hunger', 20,  10),
  ('food', 'food-premium', 'プレミアムフード',    'ちょっと贅沢なウェットフード',     8,  'hunger', 50,  20),
  ('food', 'food-deluxe',  '特選まぐろ',         '最高級まぐろ。満腹度が満タンに！', 20, 'hunger', 100, 30),
  ('toy',  'toy-teaser',   'ねこじゃらし',       'ふりふり遊んで機嫌アップ！',       5,  'mood',   30,  10),
  ('toy',  'toy-ball',     'まりボール',         'コロコロ転がしてなかよし度UP',     10, 'xp',     50,  20),
  ('toy',  'toy-catnip',   'またたびクッション',  'ゴロゴロ♪ 機嫌もなかよしもUP',    15, 'mood',   50,  30);
