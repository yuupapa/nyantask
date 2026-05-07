"use client";

import Image from "next/image";
import { useState } from "react";
import { CatSvg } from "./CatSvg";
import type { CatStatus } from "@/lib/cat";

type Props = {
  visualId: number;
  pattern: string;
  face: string;
  status?: CatStatus;
  size?: number;
  className?: string;
};

function padId(id: number): string {
  return String(id).padStart(3, "0");
}

export function CatImage({
  visualId,
  pattern,
  face,
  status = "normal",
  size = 120,
  className = "",
}: Props) {
  const [imgError, setImgError] = useState(false);
  const src = `/cats/cat-${padId(visualId)}.png`;

  if (imgError) {
    return (
      <CatSvg
        pattern={pattern}
        face={face}
        status={status}
        size={size}
        className={className}
      />
    );
  }

  const statusFilter =
    status === "sick"
      ? "hue-rotate(60deg) saturate(0.7)"
      : status === "sad"
        ? "saturate(0.5)"
        : status === "runaway"
          ? "grayscale(1) opacity(0.5)"
          : "none";

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={`猫 #${visualId}`}
        width={size}
        height={size}
        className="object-contain"
        style={{ filter: statusFilter }}
        onError={() => setImgError(true)}
        priority={size >= 120}
      />
    </div>
  );
}
