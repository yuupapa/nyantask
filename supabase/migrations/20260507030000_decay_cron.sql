-- ============================================================
-- にゃんタスク マイグレーション 10
-- 2026-05-07 - 猫の時間減衰を pg_cron で定期実行
--
-- 変更内容：
--   1. pg_cron / pg_net 拡張を有効化
--   2. 全アクティブ猫の hunger/mood を減衰する SQL 関数
--   3. 1時間ごとの cron ジョブ登録
-- ============================================================

-- 1. 拡張を有効化（Supabase では pg_cron はデフォルト利用可）
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. 減衰関数
CREATE OR REPLACE FUNCTION decay_all_active_cats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  hunger_rate CONSTANT INT := 2;  -- 1時間あたりの満腹度減少
  mood_rate   CONSTANT INT := 1;  -- 1時間あたりの機嫌減少
BEGIN
  UPDATE cats
  SET
    hunger = GREATEST(0, hunger - hunger_rate * EXTRACT(EPOCH FROM (now() - last_decay_at))::INT / 3600),
    mood   = GREATEST(0, mood   - mood_rate   * EXTRACT(EPOCH FROM (now() - last_decay_at))::INT / 3600),
    last_decay_at = now()
  WHERE is_active = true
    AND EXTRACT(EPOCH FROM (now() - last_decay_at)) >= 3600;
END;
$$;

-- 3. cron ジョブ登録（毎時0分に実行）
SELECT cron.schedule(
  'decay-active-cats',
  '0 * * * *',
  $$SELECT decay_all_active_cats()$$
);
