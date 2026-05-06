-- ============================================================
-- にゃんタスク マイグレーション 6
-- 2026-05-03 - Gemini API キーをユーザー単位で保持
--
-- profiles に gemini_api_key カラムを追加する。
--   - 既存 RLS（本人のみ閲覧・更新）でAPIキーは本人のみアクセス可
--   - service_role からは閲覧可（Server Actions が利用）
--   - MVP段階では平文保存。Phase 2 で Supabase Vault 等への移行を検討
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gemini_api_key TEXT;
