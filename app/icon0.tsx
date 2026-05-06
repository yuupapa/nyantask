import { ImageResponse } from "next/og";

// 大サイズアイコン（PWA / OG用）
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function IconLarge() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FFB8C5 0%, #FF7B9C 100%)",
          borderRadius: 96,
          fontSize: 320,
        }}
      >
        🐱
      </div>
    ),
    { ...size }
  );
}
