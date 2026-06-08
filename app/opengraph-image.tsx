import { ImageResponse } from "next/og";

export const alt = "にゃんタスク — ToDoしながら、ねこ集め！";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFF6E5",
          position: "relative",
        }}
      >
        {/* 左上の猫装飾 */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            fontSize: 64,
            opacity: 0.3,
          }}
        >
          🐱
        </div>

        {/* 右下の猫装飾 */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 40,
            fontSize: 64,
            opacity: 0.3,
          }}
        >
          🐱
        </div>

        {/* ロゴ */}
        <div
          style={{
            display: "flex",
            fontSize: 80,
            fontWeight: 900,
          }}
        >
          <span style={{ color: "#FF8FA8" }}>にゃん</span>
          <span style={{ color: "#5DAEE8" }}>タスク</span>
        </div>

        {/* キャッチコピー */}
        <div
          style={{
            marginTop: 24,
            fontSize: 32,
            color: "#6B4F1D",
          }}
        >
          ToDoしながら、ねこ集め！
        </div>
      </div>
    ),
    { ...size }
  );
}
