import { ImageResponse } from "next/og";

// PWA要件のため、192x192 と 512x512 の2サイズが必要。
// このファイルが 192x192、icon0.tsx が 512x512。
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 36,
          fontSize: 120,
        }}
      >
        🐱
      </div>
    ),
    { ...size }
  );
}
