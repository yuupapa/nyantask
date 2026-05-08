"use client";

/**
 * CatSprite — 個別フレーム画像を JS で切り替える猫アニメーションコンポーネント
 *
 * スプライト素材：public/cats/sprites/{name}-{state}.png
 *   idle フレーム : {name}-idle-0.png 〜 {name}-idle-3.png（個別 700×470px）
 *   表情フレーム  : {name}-{happy|sparkle|sad|normal}.png（個別 700×470px）
 *
 * 1 フレーム 1 ファイル方式のため隣コマのはみ出し（ブリード）が原理的に発生しない。
 * CELL_PADDING=100px のパディング付きクロップで尻尾が切れないよう配慮。
 */

import { useState, useEffect } from "react";

const FRAME_NATURAL_W = 700; // 体アライメント拡張後の出力幅（元418px → 700px、尻尾込み）
const FRAME_NATURAL_H = 470;
const FRAME_COUNT = 4;
/** 1 フレームの表示時間 (ms)。合計 3 秒 / 4 フレーム = 750ms */
const FRAME_DURATION_MS = 750;

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

  // idle アニメーション用フレームインデックス
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (state !== "idle") {
      setFrame(0);
      return;
    }
    const timer = setInterval(() => {
      setFrame((f) => (f + 1) % FRAME_COUNT);
    }, FRAME_DURATION_MS);
    return () => clearInterval(timer);
  }, [state]);

  if (state === "idle") {
    // 全フレームを重ねて描画し、現在フレームだけ opacity:1 にする。
    // 1 ファイル = 1 フレームなので隣コマのはみ出しは原理的に発生しない。
    return (
      <div
        className={className}
        style={{ width: displayW, height, position: "relative" }}
      >
        {Array.from({ length: FRAME_COUNT }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(/cats/sprites/${name}-idle-${i}.png)`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center bottom",
              opacity: frame === i ? 1 : 0,
            }}
          />
        ))}
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
