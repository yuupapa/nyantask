-- ============================================================
-- にゃんタスク マイグレーション 7
-- 2026-05-03 - Web Push 購読情報
--
-- ユーザーごとの Push Subscription を保存。
-- 同じユーザーが複数端末から購読する場合があるため、UNIQUE は (user_id, endpoint)。
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
