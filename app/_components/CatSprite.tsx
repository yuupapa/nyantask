"use client";

import Image from "next/image";

export type SpriteState = "idle" | "happy" | "sparkle" | "sad" | "normal";

type Props = {
  visualId: number;
  state?: SpriteState;
  /** 表示高さ (px)。幅も同じ値にして正方形で表示する。 */
  height?: number;
  className?: string;
};

const MIN_VISUAL_ID = 1;
const MAX_VISUAL_ID = 100;
const DEFAULT_SIZE = 200;

function normalizeVisualId(visualId: number): number {
  if (
    Number.isInteger(visualId) &&
    visualId >= MIN_VISUAL_ID &&
    visualId <= MAX_VISUAL_ID
  ) {
    return visualId;
  }
  return MIN_VISUAL_ID;
}

function normalizeSize(height: number): number {
  return Number.isFinite(height) && height > 0
    ? Math.round(height)
    : DEFAULT_SIZE;
}

function getCatImageSrc(visualId: number): string {
  return `/cats/cat-${String(visualId).padStart(3, "0")}.png`;
}

export function CatSprite({
  visualId,
  state = "idle",
  height = DEFAULT_SIZE,
  className = "",
}: Props) {
  const catId = normalizeVisualId(visualId);
  const size = normalizeSize(height);
  const classes = [
    "block object-contain",
    state === "idle" ? "cat-idle" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Image
      src={getCatImageSrc(catId)}
      alt={`猫 #${catId}`}
      width={size}
      height={size}
      className={classes}
      data-state={state}
      draggable={false}
      priority={size >= DEFAULT_SIZE}
      style={{ width: size, height: size }}
    />
  );
}
