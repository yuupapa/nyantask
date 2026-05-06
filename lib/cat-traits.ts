/**
 * 猫の個性データ（Client / Server 両対応）。
 *  - pattern: 柄（12種）
 *  - face: 顔（8種）
 *  - personality: 性格（10種）
 *
 * 12 × 8 × 10 = 960 通りの組み合わせ。
 * Phase 1.3 では絵文字 + 文字列で表現。SVG合成は将来。
 */

export const CAT_PATTERNS = [
  { id: "mike", label: "三毛", emoji: "🐈" },
  { id: "kuro", label: "黒猫", emoji: "🐈‍⬛" },
  { id: "shiro", label: "白猫", emoji: "🐱" },
  { id: "kijitora", label: "キジトラ", emoji: "🐈" },
  { id: "sabatora", label: "サバトラ", emoji: "🐈" },
  { id: "chatora", label: "茶トラ", emoji: "🐈" },
  { id: "hachiware", label: "ハチワレ", emoji: "🐱" },
  { id: "buchi", label: "ぶち", emoji: "🐱" },
  { id: "siamese", label: "シャム", emoji: "🐈" },
  { id: "russian", label: "ロシアンブルー", emoji: "🐈" },
  { id: "scottish", label: "スコティッシュ", emoji: "🐈" },
  { id: "munchkin", label: "マンチカン", emoji: "🐱" },
] as const;

export const CAT_FACES = [
  { id: "round", label: "まんまる目" },
  { id: "sharp", label: "つり目" },
  { id: "droopy", label: "たれ目" },
  { id: "sleepy", label: "しょぼ目" },
  { id: "smile", label: "笑い目" },
  { id: "cool", label: "キリッ目" },
  { id: "jit", label: "ジト目" },
  { id: "sparkle", label: "キラキラ目" },
] as const;

export const CAT_PERSONALITIES = [
  { id: "ottori", label: "おっとり" },
  { id: "tsundere", label: "ツンデレ" },
  { id: "amaenbo", label: "甘えん坊" },
  { id: "yancha", label: "やんちゃ" },
  { id: "mypace", label: "マイペース" },
  { id: "bibiri", label: "ビビり" },
  { id: "nebosuke", label: "寝坊助" },
  { id: "kuishinbo", label: "くいしんぼ" },
  { id: "yutosei", label: "優等生" },
  { id: "tensaikata", label: "天才肌" },
] as const;

export type PatternId = (typeof CAT_PATTERNS)[number]["id"];
export type FaceId = (typeof CAT_FACES)[number]["id"];
export type PersonalityId = (typeof CAT_PERSONALITIES)[number]["id"];

export function getPatternLabel(id: string): string {
  return CAT_PATTERNS.find((p) => p.id === id)?.label ?? id;
}

export function getPatternEmoji(id: string): string {
  return CAT_PATTERNS.find((p) => p.id === id)?.emoji ?? "🐱";
}

export function getFaceLabel(id: string): string {
  return CAT_FACES.find((f) => f.id === id)?.label ?? id;
}

export function getPersonalityLabel(id: string): string {
  return CAT_PERSONALITIES.find((p) => p.id === id)?.label ?? id;
}

/**
 * 個性をランダム生成（初回猫付与時に使用）。
 * レアリティはとりあえず一律 ★1（Phase 1.3）。
 * Phase 1.4 でレアリティ抽選を実装予定。
 */
export function generateRandomTraits(): {
  pattern: PatternId;
  face: FaceId;
  personality: PersonalityId;
  rarity: number;
} {
  const pickRandom = <T extends { id: string }>(arr: readonly T[]): T =>
    arr[Math.floor(Math.random() * arr.length)];

  return {
    pattern: pickRandom(CAT_PATTERNS).id,
    face: pickRandom(CAT_FACES).id,
    personality: pickRandom(CAT_PERSONALITIES).id,
    rarity: 1,
  };
}
