"use client";

/**
 * CatSprite — スプライトシートを使った猫アニメーションコンポーネント
 *
 * スプライト素材：public/cats/sprites/{name}-{state}.png
 *   - {name}-idle.png    : 4フレーム横並びストリップ（待機アニメ）
 *   - {name}-happy.png   : 表情フレーム（なかよし高・ごきげん）
 *   - {name}-sparkle.png : 表情フレーム（Lv高・ごきげん）
 *   - {name}-sad.png     : 表情フレーム（しょんぼり・体調不良）
 *   - {name}-normal.png  : 表情フレーム（ふつう）
 *
 * 素材の自然サイズ（処理スクリプト出力に合わせる）:
 *   idle strip: 1672 x 470px（418 x 470 × 4フレーム）
 *   single    : 418  x 470px
 */

const FRAME_NATURAL_W = 418;
const FRAME_NATURAL_H = 470;
const FRAME_COUNT = 4;
// 1サイクル（4フレーム）にかかる秒数。大きくするほどゆっくり。
const CYCLE_DURATION = "3s";

// 利用可能なスプライト名
const SPRITE_NAMES = ["black", "tabby", "calico"] as const;
type SpriteName = (typeof SPRITE_NAMES)[number];

export type SpriteState = "idle" | "happy" | "sparkle" | "sad" | "normal";

type Props = {
  visualId: number;
  state?: SpriteState;
  /** 表示高さ (px)。幅は素材のアスペクト比で自動計算。 */
  height?: number;
  className?: string;
};

/** visualId からスプライト名を決定（3種ローテーション） */
function getSpriteName(visualId: number): SpriteName {
  return SPRITE_NAMES[visualId % SPRITE_NAMES.length];
}

export function CatSprite({
  visualId,
  state = "idle",
  height = 200,
  className = "",
}: Props) {
  const name = getSpriteName(visualId);
  const scale = height / FRAME_NATURAL_H;
  const displayW = Math.round(FRAME_NATURAL_W * scale);
  const stripW = displayW * FRAME_COUNT;

  if (state === "idle") {
    // 外側div: 1フレーム幅でclip、内側div: ストリップ全幅をtranslateXでスライド
    // overflow:hidden が確実にクリップするため隣コマの猫が見えない
    return (
      <div
        className={className}
        style={{
          width: displayW,
          height,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: stripW,
            height,
            backgroundImage: `url(/cats/sprites/${name}-idle.png)`,
            backgroundSize: `${stripW}px ${height}px`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "0 0",
            // translateX(-100%) = -stripW（自身幅に対する割合なのでカスタムプロパティ不要）
            animation: `catSpriteIdleSlide ${CYCLE_DURATION} steps(${FRAME_COUNT}) infinite`,
          }}
        />
      </div>
    );
  }

  // 表情フレーム（単枚）
  return (
    <div
      className={className}
      style={{
        width: displayW,
        height,
        backgroundImage: `url(/cats/sprites/${name}-${state}.png)`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center bottom",
      }}
    />
  );
}
