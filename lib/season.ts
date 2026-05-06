/**
 * 季節判定と季節アクセント。
 *  - 実季節（日本の暦に合わせる）：3-5月=春、6-8月=夏、9-11月=秋、12-2月=冬
 */

export const SEASONS = ["spring", "summer", "autumn", "winter"] as const;
export type Season = (typeof SEASONS)[number];

export const SEASON_LABELS: Record<Season, string> = {
  spring: "春",
  summer: "夏",
  autumn: "秋",
  winter: "冬",
};

export const SEASON_EMOJI: Record<Season, string> = {
  spring: "🌸",
  summer: "🌻",
  autumn: "🍁",
  winter: "❄️",
};

export const SEASON_BG: Record<Season, string> = {
  spring: "bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50",
  summer: "bg-gradient-to-br from-cyan-50 via-sky-50 to-yellow-50",
  autumn: "bg-gradient-to-br from-orange-50 via-amber-50 to-red-50",
  winter: "bg-gradient-to-br from-sky-50 via-indigo-50 to-slate-50",
};

export const SEASON_ACCENT: Record<Season, string> = {
  spring: "text-pink-500",
  summer: "text-cyan-600",
  autumn: "text-orange-600",
  winter: "text-indigo-500",
};

export const SEASON_DECORATIONS: Record<Season, readonly string[]> = {
  spring: ["🌸", "🌷", "🌼"],
  summer: ["🌻", "🍉", "🌊"],
  autumn: ["🍁", "🍂", "🌰"],
  winter: ["❄️", "⛄", "🎄"],
};

/**
 * 現在の日付から季節を判定（日本の暦）。
 */
export function getCurrentSeason(date: Date = new Date()): Season {
  const month = date.getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}
