-- ============================================================
-- にゃんタスク マイグレーション 8
-- 2026-05-07 - Gemini APIキーを Supabase Vault で暗号化保存
--
-- 変更内容：
--   1. profiles に gemini_vault_id カラム追加
--   2. Vault 操作用 SQL Functions を作成（SECURITY DEFINER）
--   3. 既存の gemini_api_key は後続マイグレーションで削除
-- ============================================================

-- 1. profiles に Vault シークレット ID を保持するカラムを追加
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gemini_vault_id UUID;

-- 2. キーの保存/更新関数
--    ・初回 → vault.create_secret() でシークレット作成 → IDを profiles に保存
--    ・2回目以降 → vault.update_secret() で上書き
CREATE OR REPLACE FUNCTION set_user_gemini_key(p_key TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_vault_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT gemini_vault_id INTO v_vault_id
  FROM profiles WHERE id = v_user_id;

  IF v_vault_id IS NULL THEN
    -- 新規作成
    SELECT vault.create_secret(p_key, 'gemini_' || v_user_id::text)
    INTO v_vault_id;
    UPDATE profiles SET gemini_vault_id = v_vault_id WHERE id = v_user_id;
  ELSE
    -- 更新
    PERFORM vault.update_secret(v_vault_id, p_key);
  END IF;
END;
$$;

-- 3. キーの取得関数（復号して返す）
CREATE OR REPLACE FUNCTION get_user_gemini_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_vault_id UUID;
  v_key TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT gemini_vault_id INTO v_vault_id
  FROM profiles WHERE id = v_user_id;

  IF v_vault_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT decrypted_secret INTO v_key
  FROM vault.decrypted_secrets WHERE id = v_vault_id;

  RETURN v_key;
END;
$$;

-- 4. キーの削除関数
CREATE OR REPLACE FUNCTION delete_user_gemini_key()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_vault_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT gemini_vault_id INTO v_vault_id
  FROM profiles WHERE id = v_user_id;

  IF v_vault_id IS NOT NULL THEN
    PERFORM vault.delete_secret(v_vault_id);
    UPDATE profiles SET gemini_vault_id = NULL WHERE id = v_user_id;
  END IF;
END;
$$;

-- 5. GRANT（authenticated ロールから呼べるようにする）
GRANT EXECUTE ON FUNCTION set_user_gemini_key(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_gemini_key() TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_gemini_key() TO authenticated;

-- ============================================================
-- NOTE: 既存データ移行手順（結パパ手動）
--
-- 現在 profiles.gemini_api_key に値が入っている場合、
-- 以下の SQL で Vault に移行してから gemini_api_key カラムを削除する：
--
-- DO $$
-- DECLARE r RECORD;
-- BEGIN
--   FOR r IN SELECT id, gemini_api_key FROM profiles WHERE gemini_api_key IS NOT NULL LOOP
--     UPDATE profiles SET gemini_vault_id = vault.create_secret(r.gemini_api_key, 'gemini_' || r.id::text)
--     WHERE id = r.id;
--   END LOOP;
-- END;
-- $$;
--
-- -- 移行確認後にカラム削除（別マイグレーションで実施）
-- -- ALTER TABLE profiles DROP COLUMN gemini_api_key;
-- ============================================================
