-- ============================================================
-- にゃんタスク 初期マイグレーション
-- 2026-05-02 - profiles + invitations + RBAC + 自動プロフィール作成
--
-- ※ 再実行可能なように冒頭で既存オブジェクトを DROP してから CREATE します
-- ============================================================

-- ============================================================
-- クリーンアップ（既存オブジェクトを削除）
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS update_last_seen() CASCADE;
DROP TABLE IF EXISTS invitations CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS join_method CASCADE;

-- ============================================================
-- ロール定義
-- ============================================================
CREATE TYPE user_role AS ENUM ('admin', 'consultant_student', 'member', 'general');
CREATE TYPE join_method AS ENUM ('invitation', 'direct', 'membership_link');

-- ============================================================
-- profiles テーブル（auth.users と 1:1 連動）
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  role user_role NOT NULL DEFAULT 'general',
  joined_via join_method NOT NULL DEFAULT 'direct',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- ============================================================
-- invitations テーブル（事前メアド登録方式）
-- ============================================================
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'consultant_student',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at TIMESTAMPTZ
);

CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_used ON invitations(used_at) WHERE used_at IS NULL;

-- ============================================================
-- ユーザー登録時に profiles を自動作成するトリガー
--   - invitations にメアドがあれば指定ロール付与
--   - なければ general ロール
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invited_role user_role;
  joined_method join_method;
BEGIN
  SELECT role INTO invited_role
  FROM invitations
  WHERE email = NEW.email AND used_at IS NULL;

  IF FOUND THEN
    joined_method := 'invitation';
    UPDATE invitations SET used_at = now() WHERE email = NEW.email;
  ELSE
    invited_role := 'general';
    joined_method := 'direct';
  END IF;

  INSERT INTO profiles (id, email, display_name, role, joined_via)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    invited_role,
    joined_method
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 管理者判定用ヘルパー関数
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- RLS（Row Level Security）
-- ============================================================

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_or_admin" ON profiles
  FOR SELECT
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "update_own_display_name" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "admin_can_update_all" ON profiles
  FOR UPDATE
  USING (is_admin());

-- invitations（adminのみ全権）
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_only_select" ON invitations
  FOR SELECT USING (is_admin());

CREATE POLICY "admin_only_insert" ON invitations
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "admin_only_update" ON invitations
  FOR UPDATE USING (is_admin());

CREATE POLICY "admin_only_delete" ON invitations
  FOR DELETE USING (is_admin());

-- ============================================================
-- テーブル権限の付与（authenticated / service_role）
--   ※ RLS と併用：基本権限はここで、レコード制御は RLS で
-- ============================================================

-- profiles
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- invitations
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invitations TO authenticated;
GRANT ALL ON public.invitations TO service_role;
