-- 猫に visual_id カラムを追加（1〜100のユニーク画像ID）
ALTER TABLE cats ADD COLUMN IF NOT EXISTS visual_id INTEGER NOT NULL DEFAULT 1;

-- 既存の猫にランダムな visual_id を割り当て
UPDATE cats SET visual_id = floor(random() * 100 + 1)::int WHERE visual_id = 1;
