-- ============================================================
-- にゃんタスク マイグレーション 3
-- 2026-05-03 - タスク管理（ルーチン/デイリー + 完了履歴）
--
-- テーブル:
--   - tasks            タスクマスター
--   - task_completions 完了履歴（日付ごと）
--
-- 設計:
--   - ルーチンタスク: type='routine'、for_date は NULL。毎日表示
--   - デイリータスク: type='daily'、for_date 必須。その日だけ表示
--   - 完了/未完了は task_completions に for_date 単位で記録
--     （UNIQUE 制約で同じ日に2回完了することを防ぐ）
-- ============================================================

-- 再実行可能にするためクリーンアップ
DROP TABLE IF EXISTS task_completions CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TYPE IF EXISTS task_type CASCADE;

-- タスク種別
CREATE TYPE task_type AS ENUM ('routine', 'daily');

-- タスクマスター
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) > 0 AND length(title) <= 200),
  type task_type NOT NULL,
  for_date DATE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_user_active ON tasks(user_id) WHERE archived_at IS NULL;
CREATE INDEX idx_tasks_for_date ON tasks(user_id, for_date) WHERE for_date IS NOT NULL;

-- タスク完了履歴
CREATE TABLE task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  for_date DATE NOT NULL,
  UNIQUE(task_id, for_date)
);

CREATE INDEX idx_completions_user_date ON task_completions(user_id, for_date);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;

-- tasks
CREATE POLICY "tasks_select_own_or_admin" ON tasks
  FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "tasks_insert_own" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_update_own" ON tasks
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_delete_own" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- task_completions
CREATE POLICY "completions_select_own_or_admin" ON task_completions
  FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "completions_insert_own" ON task_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "completions_delete_own" ON task_completions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- GRANT（authenticated と service_role）
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
GRANT SELECT, INSERT, DELETE ON public.task_completions TO authenticated;
GRANT ALL ON public.task_completions TO service_role;
