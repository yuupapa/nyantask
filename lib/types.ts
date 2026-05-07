/**
 * Client / Server 両方から安全にインポートできる共有型・定数。
 * （`next/headers` などサーバー専用モジュールを参照しないこと）
 */

export const USER_ROLES = ["admin", "general"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "管理者",
  general: "一般",
};

export function isValidRole(role: string): role is UserRole {
  return (USER_ROLES as readonly string[]).includes(role);
}

export type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  role: UserRole;
  coin: number;
  paw: number;
  has_gemini_key: boolean;
  created_at: string;
  last_seen_at: string;
};

// ============================================================
// 通貨
// ============================================================

export const CURRENCY_KINDS = ["coin", "paw"] as const;
export type CurrencyKind = (typeof CURRENCY_KINDS)[number];

export const CURRENCY_LABELS: Record<CurrencyKind, string> = {
  coin: "コイン",
  paw: "にくきゅう",
};

export const CURRENCY_EMOJI: Record<CurrencyKind, string> = {
  coin: "🪙",
  paw: "🐾",
};

export const CURRENCY_REASONS = [
  "task_complete",
  "task_uncomplete",
  "daily_perfect_bonus",
  "friendship_levelup",
  "streak_bonus",
  "secret_cat",
  "admin_grant",
  "spend_summon",
  "other",
] as const;
export type CurrencyReason = (typeof CURRENCY_REASONS)[number];

export type CurrencyTransaction = {
  id: string;
  user_id: string;
  kind: CurrencyKind;
  amount: number;
  reason: CurrencyReason;
  related_id: string | null;
  note: string | null;
  created_at: string;
};

// ============================================================
// Web Push 購読
// ============================================================

export type PushSubscriptionRow = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth_secret: string;
  user_agent: string | null;
  created_at: string;
};

// ============================================================
// タスク
// ============================================================

export const TASK_TYPES = ["routine", "daily"] as const;
export type TaskType = (typeof TASK_TYPES)[number];

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  routine: "ルーチンタスク",
  daily: "今日だけのタスク",
};

export type Task = {
  id: string;
  user_id: string;
  title: string;
  type: TaskType;
  for_date: string | null;
  sort_order: number;
  archived_at: string | null;
  created_at: string;
};

export type TaskCompletion = {
  id: string;
  task_id: string;
  user_id: string;
  completed_at: string;
  for_date: string;
};

// ============================================================
// 猫
// ============================================================

export type Cat = {
  id: string;
  user_id: string;
  name: string;
  visual_id: number;
  pattern: string;
  face: string;
  personality: string;
  rarity: number;
  hunger: number;
  mood: number;
  friendship_xp: number;
  is_active: boolean;
  is_runaway: boolean;
  born_at: string;
  last_decay_at: string;
  created_at: string;
};

export const CAT_VISUAL_COUNT = 100;

// ============================================================
// ショップ
// ============================================================

export const SHOP_CATEGORIES = ["food", "furniture", "toy"] as const;
export type ShopCategory = (typeof SHOP_CATEGORIES)[number];

export const SHOP_CATEGORY_LABELS: Record<ShopCategory, string> = {
  food: "ごはん",
  furniture: "インテリア",
  toy: "おもちゃ",
};

export const SHOP_CATEGORY_EMOJI: Record<ShopCategory, string> = {
  food: "🍽️",
  furniture: "🪑",
  toy: "🧸",
};

export type ShopItem = {
  id: string;
  category: ShopCategory;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  effect_type: "hunger" | "mood" | "xp" | null;
  effect_value: number;
  sort_order: number;
};

export type UserItem = {
  id: string;
  user_id: string;
  item_id: string;
  quantity: number;
  created_at: string;
};
