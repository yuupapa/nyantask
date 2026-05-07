/**
 * SVG レイヤー合成による猫イラスト。
 * pattern(柄) × face(表情) × status(状態) の組み合わせで
 * ねこあつめ風のゆるい猫を描画する。
 */

import type { CatStatus } from "@/lib/cat";
import type { PatternId, FaceId } from "@/lib/cat-traits";

type Props = {
  pattern: string;
  face: string;
  status?: CatStatus;
  size?: number;
  className?: string;
};

// ─── 柄ごとの配色 ───
const PATTERN_COLORS: Record<string, { body: string; accent: string; ear: string; nose: string }> = {
  mike:     { body: "#FFF5E6", accent: "#E8963A", ear: "#F5C882", nose: "#E88B8B" },
  kuro:     { body: "#3A3A3A", accent: "#2A2A2A", ear: "#4A4A4A", nose: "#555555" },
  shiro:    { body: "#FEFEFE", accent: "#F0EDE8", ear: "#F5F0EA", nose: "#F5B5B5" },
  kijitora: { body: "#C4944A", accent: "#8B6530", ear: "#B8873F", nose: "#B07070" },
  sabatora: { body: "#A0A0A0", accent: "#707070", ear: "#909090", nose: "#C09090" },
  chatora:  { body: "#F0A848", accent: "#D08828", ear: "#E09838", nose: "#E09090" },
  hachiware:{ body: "#FEFEFE", accent: "#3A3A3A", ear: "#D0D0D0", nose: "#F5B5B5" },
  buchi:    { body: "#FEFEFE", accent: "#6A6A6A", ear: "#E8E4E0", nose: "#F0A8A8" },
  siamese:  { body: "#F5EDE0", accent: "#8B7355", ear: "#A08868", nose: "#B09080" },
  russian:  { body: "#A0B0C0", accent: "#8898A8", ear: "#94A4B4", nose: "#C0A0A0" },
  scottish: { body: "#E8D8C0", accent: "#C8A880", ear: "#D8C8A8", nose: "#E0A0A0" },
  munchkin: { body: "#F0D8B0", accent: "#D0B080", ear: "#E0C8A0", nose: "#E8A8A8" },
};

const DEFAULT_COLORS = { body: "#F0D8B0", accent: "#D0B080", ear: "#E0C8A0", nose: "#E8A8A8" };

function getColors(pattern: string) {
  return PATTERN_COLORS[pattern] ?? DEFAULT_COLORS;
}

// ─── 柄の模様パス（体の上に重ねる） ───
function PatternOverlay({ pattern, accent }: { pattern: string; accent: string }) {
  switch (pattern) {
    case "mike":
      return (
        <>
          <circle cx="35" cy="42" r="12" fill={accent} opacity="0.6" />
          <circle cx="68" cy="55" r="10" fill="#3A3A3A" opacity="0.5" />
          <circle cx="50" cy="68" r="8" fill={accent} opacity="0.5" />
        </>
      );
    case "kijitora":
    case "sabatora":
      return (
        <>
          <path d="M32 30 Q50 28 68 30" stroke={accent} strokeWidth="3" fill="none" opacity="0.5" />
          <path d="M30 40 Q50 38 70 40" stroke={accent} strokeWidth="3" fill="none" opacity="0.5" />
          <path d="M32 50 Q50 48 68 50" stroke={accent} strokeWidth="3" fill="none" opacity="0.5" />
        </>
      );
    case "chatora":
      return (
        <>
          <path d="M35 32 Q50 30 65 32" stroke={accent} strokeWidth="4" fill="none" opacity="0.4" />
          <path d="M33 45 Q50 43 67 45" stroke={accent} strokeWidth="4" fill="none" opacity="0.4" />
        </>
      );
    case "hachiware":
      return (
        <path d="M50 18 L50 45 Q50 50 55 50 L70 50 Q75 50 75 42 L75 28 Q68 18 50 18Z" fill={accent} opacity="0.85" />
      );
    case "buchi":
      return (
        <>
          <circle cx="38" cy="40" r="10" fill={accent} opacity="0.6" />
          <circle cx="62" cy="52" r="8" fill={accent} opacity="0.5" />
        </>
      );
    case "siamese":
      return (
        <>
          <ellipse cx="50" cy="38" rx="12" ry="8" fill={accent} opacity="0.3" />
        </>
      );
    default:
      return null;
  }
}

// ─── 表情（目＋口） ───
function FaceFeatures({ face, status, isKuro }: { face: string; status: CatStatus; isKuro: boolean }) {
  const eyeColor = isKuro ? "#EEEEEE" : "#2C1810";
  const mouthColor = isKuro ? "#CCCCCC" : "#2C1810";

  if (status === "runaway") {
    return (
      <g opacity="0.4">
        <text x="50" y="42" textAnchor="middle" fontSize="10" fill={eyeColor}>? ?</text>
      </g>
    );
  }

  const statusMod = status === "sick" ? "sick" : status === "sad" ? "sad" : "normal";

  return (
    <>
      <Eyes face={face as FaceId} color={eyeColor} statusMod={statusMod} />
      <Mouth face={face as FaceId} color={mouthColor} statusMod={statusMod} />
      {status === "happy" && <Blush />}
    </>
  );
}

function Blush() {
  return (
    <>
      <ellipse cx="34" cy="44" rx="5" ry="3" fill="#FF9999" opacity="0.35" />
      <ellipse cx="66" cy="44" rx="5" ry="3" fill="#FF9999" opacity="0.35" />
    </>
  );
}

function Eyes({ face, color, statusMod }: { face: FaceId; color: string; statusMod: string }) {
  if (statusMod === "sick") {
    return (
      <>
        <line x1="38" y1="35" x2="44" y2="41" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <line x1="44" y1="35" x2="38" y2="41" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <line x1="56" y1="35" x2="62" y2="41" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <line x1="62" y1="35" x2="56" y2="41" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </>
    );
  }

  if (statusMod === "sad") {
    return (
      <>
        <ellipse cx="41" cy="38" rx="4" ry="5" fill={color} />
        <ellipse cx="59" cy="38" rx="4" ry="5" fill={color} />
        <ellipse cx="41" cy="37" rx="1.5" ry="2" fill="white" />
        <ellipse cx="59" cy="37" rx="1.5" ry="2" fill="white" />
        {/* 涙 */}
        <ellipse cx="36" cy="44" rx="1.5" ry="2.5" fill="#88CCFF" opacity="0.6" />
      </>
    );
  }

  switch (face) {
    case "round":
      return (
        <>
          <circle cx="41" cy="38" r="4.5" fill={color} />
          <circle cx="59" cy="38" r="4.5" fill={color} />
          <circle cx="42.5" cy="37" r="1.5" fill="white" />
          <circle cx="60.5" cy="37" r="1.5" fill="white" />
        </>
      );
    case "sharp":
      return (
        <>
          <ellipse cx="41" cy="38" rx="5" ry="3.5" fill={color} />
          <ellipse cx="59" cy="38" rx="5" ry="3.5" fill={color} />
          <circle cx="43" cy="37.5" r="1.2" fill="white" />
          <circle cx="61" cy="37.5" r="1.2" fill="white" />
        </>
      );
    case "droopy":
      return (
        <>
          <ellipse cx="41" cy="38" rx="4" ry="5" fill={color} />
          <ellipse cx="59" cy="38" rx="4" ry="5" fill={color} />
          <path d="M36 35 Q41 33 46 35" stroke={color} strokeWidth="1.5" fill="none" />
          <path d="M54 35 Q59 33 64 35" stroke={color} strokeWidth="1.5" fill="none" />
          <ellipse cx="41" cy="37" rx="1.5" ry="2" fill="white" />
          <ellipse cx="59" cy="37" rx="1.5" ry="2" fill="white" />
        </>
      );
    case "sleepy":
      return (
        <>
          <path d="M37 38 Q41 41 45 38" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M55 38 Q59 41 63 38" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      );
    case "smile":
      return (
        <>
          <path d="M37 37 Q41 34 45 37" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M55 37 Q59 34 63 37" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      );
    case "cool":
      return (
        <>
          <ellipse cx="41" cy="38" rx="5" ry="3" fill={color} />
          <ellipse cx="59" cy="38" rx="5" ry="3" fill={color} />
          <line x1="36" y1="34" x2="46" y2="35" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <line x1="54" y1="35" x2="64" y2="34" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <circle cx="42" cy="37.5" r="1" fill="white" />
          <circle cx="60" cy="37.5" r="1" fill="white" />
        </>
      );
    case "jit":
      return (
        <>
          <ellipse cx="41" cy="38" rx="3.5" ry="2.5" fill={color} />
          <ellipse cx="59" cy="38" rx="3.5" ry="2.5" fill={color} />
          <line x1="37" y1="35" x2="45" y2="36" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <line x1="55" y1="36" x2="63" y2="35" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </>
      );
    case "sparkle":
      return (
        <>
          <circle cx="41" cy="38" r="5" fill={color} />
          <circle cx="59" cy="38" r="5" fill={color} />
          <circle cx="42.5" cy="36" r="2" fill="white" />
          <circle cx="60.5" cy="36" r="2" fill="white" />
          <circle cx="40" cy="39" r="1" fill="white" />
          <circle cx="58" cy="39" r="1" fill="white" />
        </>
      );
    default:
      return (
        <>
          <circle cx="41" cy="38" r="4" fill={color} />
          <circle cx="59" cy="38" r="4" fill={color} />
          <circle cx="42" cy="37" r="1.5" fill="white" />
          <circle cx="60" cy="37" r="1.5" fill="white" />
        </>
      );
  }
}

function Mouth({ face, color, statusMod }: { face: FaceId; color: string; statusMod: string }) {
  if (statusMod === "sick") {
    return <path d="M46 48 Q50 46 54 48" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />;
  }
  if (statusMod === "sad") {
    return <path d="M46 49 Q50 46 54 49" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />;
  }

  switch (face) {
    case "smile":
    case "sparkle":
      return (
        <path d="M44 47 Q50 52 56 47" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      );
    case "cool":
    case "jit":
      return (
        <path d="M46 48 L50 48 L54 48" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      );
    case "sleepy":
      return (
        <>
          <path d="M46 47 Q50 50 54 47" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <text x="64" y="34" fontSize="6" fill="#88AACC" opacity="0.5">z</text>
          <text x="68" y="30" fontSize="8" fill="#88AACC" opacity="0.4">z</text>
        </>
      );
    default:
      return (
        <>
          <path d="M47 47 Q50 50 53 47" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <line x1="50" y1="47" x2="50" y2="50" stroke={color} strokeWidth="1" />
        </>
      );
  }
}

// ─── ひげ ───
function Whiskers({ color }: { color: string }) {
  return (
    <g stroke={color} strokeWidth="0.8" opacity="0.4">
      <line x1="28" y1="42" x2="38" y2="44" />
      <line x1="27" y1="46" x2="38" y2="46" />
      <line x1="62" y1="44" x2="72" y2="42" />
      <line x1="62" y1="46" x2="73" y2="46" />
    </g>
  );
}

// ─── メインコンポーネント ───
export function CatSvg({ pattern, face, status = "normal", size = 120, className = "" }: Props) {
  const colors = getColors(pattern);
  const isKuro = pattern === "kuro";
  const whiskerColor = isKuro ? "#888888" : "#2C1810";

  return (
    <svg
      viewBox="0 0 100 85"
      width={size}
      height={size * 0.85}
      className={className}
      aria-label="猫イラスト"
    >
      {/* 耳 */}
      <polygon points="25,25 32,8 42,28" fill={colors.ear} />
      <polygon points="58,28 68,8 75,25" fill={colors.ear} />
      <polygon points="28,23 33,13 39,26" fill="#FFAAAA" opacity="0.4" />
      <polygon points="61,26 67,13 72,23" fill="#FFAAAA" opacity="0.4" />

      {/* 体（丸っこいシルエット） */}
      <ellipse cx="50" cy="55" rx="30" ry="25" fill={colors.body} />

      {/* 頭 */}
      <circle cx="50" cy="38" r="25" fill={colors.body} />

      {/* 柄の模様 */}
      <PatternOverlay pattern={pattern} accent={colors.accent} />

      {/* 鼻 */}
      <ellipse cx="50" cy="44" rx="2.5" ry="2" fill={colors.nose} />

      {/* 表情 */}
      <FaceFeatures face={face} status={status} isKuro={isKuro} />

      {/* ひげ */}
      <Whiskers color={whiskerColor} />

      {/* 前足（ちょこんと出す） */}
      <ellipse cx="38" cy="74" rx="7" ry="4" fill={colors.body} />
      <ellipse cx="62" cy="74" rx="7" ry="4" fill={colors.body} />
      <ellipse cx="38" cy="75" rx="4" ry="2" fill={colors.accent} opacity="0.3" />
      <ellipse cx="62" cy="75" rx="4" ry="2" fill={colors.accent} opacity="0.3" />

      {/* しっぽ */}
      <path
        d="M78 60 Q88 50 85 40"
        stroke={colors.body}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
