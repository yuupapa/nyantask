/**
 * 猫の状態計算ロジック（Client / Server 両対応、依存なし）。
 *  - 成長ステージ：日数ベース（30日でレジェンド）
 *  - なかよしLv：経験値の二次関数
 *  - 状態判定：hunger/mood の平均から
 *  - 時間減衰：last_decay_at からの経過時間で hunger -2/h, mood -1/h
 */

// ============================================================
// 成長ステージ
// ============================================================
export const CAT_STAGES = ["baby", "kitten", "young", "adult", "legend"] as const;
export type CatStage = (typeof CAT_STAGES)[number];

export const STAGE_LABELS: Record<CatStage, string> = {
  baby: "赤ちゃん猫",
  kitten: "子猫",
  young: "若猫",
  adult: "成猫",
  legend: "レジェンド猫",
};

export function getDaysSinceBorn(bornAt: string | Date): number {
  const ms = Date.now() - new Date(bornAt).getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

export function getStage(bornAt: string | Date): CatStage {
  const days = getDaysSinceBorn(bornAt);
  if (days < 8) return "baby";
  if (days < 15) return "kitten";
  if (days < 22) return "young";
  if (days < 31) return "adult";
  return "legend";
}

// ============================================================
// なかよしLv（経験値ベース）
// 必要 xp: Lv N → N+1 = 50 × N²
//   Lv 1: 0 xp, Lv 2: 50 xp, Lv 3: 200, Lv 4: 450, Lv 5: 800, Lv 10: 4050
// ============================================================
export function getFriendshipLevel(xp: number): number {
  if (xp < 50) return 1;
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

export function xpForLevel(lv: number): number {
  if (lv <= 1) return 0;
  return 50 * Math.pow(lv - 1, 2);
}

export function xpProgress(xp: number): {
  level: number;
  current: number;
  needed: number;
  pct: number;
} {
  const level = getFriendshipLevel(xp);
  const start = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const current = Math.max(0, xp - start);
  const needed = Math.max(1, next - start);
  const pct = Math.min(100, Math.round((current / needed) * 100));
  return { level, current, needed, pct };
}

// ============================================================
// 状態（ごきげん〜家出）
// ============================================================
export const CAT_STATUSES = ["happy", "normal", "sad", "sick", "runaway"] as const;
export type CatStatus = (typeof CAT_STATUSES)[number];

export const STATUS_LABELS: Record<CatStatus, string> = {
  happy: "ごきげん",
  normal: "ふつう",
  sad: "しょんぼり",
  sick: "体調不良",
  runaway: "家出中",
};

export const STATUS_EMOJI: Record<CatStatus, string> = {
  happy: "😸",
  normal: "🐱",
  sad: "😿",
  sick: "🤒",
  runaway: "🚪",
};

export function getStatus(input: {
  hunger: number;
  mood: number;
  is_runaway: boolean;
}): CatStatus {
  if (input.is_runaway) return "runaway";
  const avg = (input.hunger + input.mood) / 2;
  if (avg < 20) return "sick";
  if (avg < 40) return "sad";
  if (avg < 70) return "normal";
  return "happy";
}

// ============================================================
// 時間減衰
//   1時間ごとに hunger -2、mood -1
//   下限は 0
// ============================================================
const HUNGER_DECAY_PER_HOUR = 2;
const MOOD_DECAY_PER_HOUR = 1;

export function calculateDecay(
  lastDecayAt: string | Date,
  currentHunger: number,
  currentMood: number
): { hunger: number; mood: number; decayedHours: number } {
  const elapsedMs = Date.now() - new Date(lastDecayAt).getTime();
  const hours = Math.max(0, Math.floor(elapsedMs / (60 * 60 * 1000)));
  if (hours === 0) {
    return { hunger: currentHunger, mood: currentMood, decayedHours: 0 };
  }
  const newHunger = Math.max(0, currentHunger - hours * HUNGER_DECAY_PER_HOUR);
  const newMood = Math.max(0, currentMood - hours * MOOD_DECAY_PER_HOUR);
  return { hunger: newHunger, mood: newMood, decayedHours: hours };
}

// ============================================================
// 餌の効果（タスク完了時）
// ============================================================
export const FEED_HUNGER_PLUS = 5;
export const FEED_MOOD_PLUS = 3;
export const FEED_XP_PLUS = 10;

export function applyFeed(input: {
  hunger: number;
  mood: number;
  friendship_xp: number;
}): { hunger: number; mood: number; friendship_xp: number } {
  return {
    hunger: Math.min(100, input.hunger + FEED_HUNGER_PLUS),
    mood: Math.min(100, input.mood + FEED_MOOD_PLUS),
    friendship_xp: input.friendship_xp + FEED_XP_PLUS,
  };
}

// ============================================================
// 見た目モード（なかよしLv × 状態 で決定）
// ============================================================
export const APPEARANCE_MODES = [
  "sparkle", // ✨ 高Lv + ごきげん
  "happy",   // 💕 中Lv以上 + ごきげん
  "normal",  // 通常
  "sad",     // 💧 状態悪化
  "grumpy",  // 💢 低Lv + 状態悪化、家出
] as const;
export type AppearanceMode = (typeof APPEARANCE_MODES)[number];

export const APPEARANCE_DECORATIONS: Record<AppearanceMode, string> = {
  sparkle: "✨",
  happy: "💕",
  normal: "",
  sad: "💧",
  grumpy: "💢",
};

export const APPEARANCE_BG: Record<AppearanceMode, string> = {
  sparkle: "bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100",
  happy: "bg-gradient-to-br from-pink-50 to-orange-50",
  normal: "bg-white",
  sad: "bg-gray-100",
  grumpy: "bg-gradient-to-br from-gray-200 to-gray-300",
};

export const APPEARANCE_RING: Record<AppearanceMode, string> = {
  sparkle: "ring-4 ring-yellow-300/50",
  happy: "ring-2 ring-pink-200",
  normal: "",
  sad: "ring-2 ring-gray-300",
  grumpy: "grayscale opacity-80",
};

/**
 * なかよしLv と 状態 から見た目モードを決定する。
 *  - 家出中 → grumpy
 *  - 高Lv (6+) + ごきげん → sparkle
 *  - 中Lv (3+) + ごきげん → happy
 *  - 低Lv (1-2) + 状態悪い → grumpy
 *  - 状態悪い → sad
 *  - 上記以外 → normal
 */
export function getAppearance(input: {
  friendshipLevel: number;
  status: CatStatus;
}): AppearanceMode {
  const { friendshipLevel, status } = input;

  if (status === "runaway") return "grumpy";

  if (friendshipLevel >= 6 && status === "happy") return "sparkle";
  if (friendshipLevel >= 3 && status === "happy") return "happy";

  if (friendshipLevel <= 2 && (status === "sad" || status === "sick")) {
    return "grumpy";
  }
  if (status === "sad" || status === "sick") return "sad";

  return "normal";
}
