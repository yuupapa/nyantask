-- ============================================================
-- にゃんタスク マイグレーション 2
-- 2026-05-03 - ロール体系を簡素化（admin / general のみ）
--
-- 変更内容:
--   - invitations テーブル削除
--   - profiles.joined_via カラム削除
--   - join_method ENUM 削除
--   - handle_new_user トリガーから invitations 参照を撤廃
--   - 既存ユーザーの consultant_student / member ロールは general に変換
--
-- 注意:
--   user_role ENUM の余分な値（consultant_student / member）は
--   PostgreSQL の制約で技術的に削除困難なため、ENUM 内には残します。
--   コード側で admin / general のみを扱うので機能上は問題ありません。
-- ============================================================

-- 既存の不要ロールを general に変換
UPDATE profiles SET role = 'general'
WHERE role::text IN ('consultant_student', 'member');

-- invitations テーブル削除（RLSポリシー含めて CASCADE で削除）
DROP TABLE IF EXISTS invitations CASCADE;

-- handle_new_user トリガー再作成（invitations 参照を撤廃、シンプル化）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    'general'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- profiles.joined_via カラム削除
ALTER TABLE profiles DROP COLUMN IF EXISTS joined_via;

-- join_method ENUM 削除（参照カラムが削除されたので可能）
DROP TYPE IF EXISTS join_method;
