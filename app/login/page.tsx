"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import Image from "next/image";
import { DECOR_ASSETS, LOGIN_VIEWBOX, pct } from "./_assets";

// ============================================================
// テキスト位置・サイズ調整（ここの数値を変えれば位置が動く）
// 単位はすべて viewBox 座標（幅 705.75 × 高さ 1254）
// ============================================================
const TEXT_CONFIG = {
  // 吹き出し円形エリアの開始 Y（吹き出し画像の top と同じ値）
  bubbleTop: 74.45,
  // 吹き出し円形エリアの高さ（大きくすると中心が下に下がる）
  bubbleCircleH: 380,
  // 「ToDoしながら、」のフォントサイズ clamp(min, vw, max)
  subFontMin: 20,   // px
  subFontVw: 5.6,   // vw
  subFontMax: 28,   // px
  // 「ねこ集め！」のフォントサイズ clamp(min, vw, max)
  mainFontMin: 42,  // px ← ここを増やすと大きくなる
  mainFontVw: 11.5, // vw
  mainFontMax: 58,  // px
};

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-nyan-cream flex items-start justify-center">
      <div
        className="relative w-full"
        style={{
          maxWidth: 440,
          aspectRatio: `${LOGIN_VIEWBOX.w} / ${LOGIN_VIEWBOX.h}`,
        }}
      >
        {/* ─────────────────────────────────
            背景アセット（モックアップそのまま）
        ───────────────────────────────── */}
        {DECOR_ASSETS.map((a) => (
          <div
            key={a.idx}
            style={{
              position: "absolute",
              left: pct(a.x, "w"),
              top: pct(a.y, "h"),
              width: pct(a.w, "w"),
              height: pct(a.h, "h"),
              zIndex: a.z ?? 1,
            }}
          >
            <Image
              src={a.src}
              alt=""
              fill
              style={{ objectFit: "contain" }}
              priority={a.key === "speech_bubble" || a.key.startsWith("cat_")}
            />
          </div>
        ))}

        {/* 吹き出しテキストは img-35 に焼き込み済みのため HTML オーバーレイ不要 */}

        {/* ─────────────────────────────────
            「にゃんタスク」ロゴ（リボンの上）
        ───────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: pct(605, "h"),
            zIndex: 8,
            textAlign: "center",
          }}
        >
          <h2
            className="font-black tracking-tight inline-block"
            style={{
              fontSize: "clamp(40px, 11vw, 60px)",
              fontFamily:
                "'Hiragino Maru Gothic ProN', 'Yu Gothic UI', sans-serif",
              textShadow: "3px 3px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 0 6px 12px rgba(0,0,0,0.1)",
              lineHeight: 1,
            }}
          >
            <span style={{ color: "#FF8FA8" }}>にゃん</span>
            <span style={{ color: "#5DAEE8" }}>タスク</span>
          </h2>
        </div>

        {/* リボンテキストは img-50 に焼き込み済みのため HTML オーバーレイ不要 */}

        {/* ─────────────────────────────────
            Google ログインボタン
        ───────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            left: pct(70, "w"),
            top: pct(770, "h"),
            width: pct(565, "w"),
            zIndex: 10,
          }}
        >
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 border border-gray-100 active:scale-[0.98]"
            style={{
              padding: "14px 24px",
              fontSize: "clamp(15px, 3.8vw, 18px)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
              <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
            </svg>
            <span className="font-bold text-gray-800">
              {loading ? "ログイン中..." : "Googleでログイン"}
            </span>
          </button>

          {error && (
            <p className="mt-3 text-red-600 text-sm text-center">エラー: {error}</p>
          )}

          <p
            className="text-center text-gray-500 leading-relaxed flex items-center justify-center gap-1 flex-wrap"
            style={{ fontSize: "clamp(10px, 2.6vw, 12px)", marginTop: "10px" }}
          >
            <span>🔒</span>
            <span>
              ログインすると、
              <span className="underline">利用規約</span>と
              <span className="underline">プライバシーポリシー</span>に
              同意したことになります。
            </span>
          </p>
        </div>

        {/* ─────────────────────────────────
            「にゃんタスクでできること」見出し
            （smile_mark の間。y ≈ 969 付近）
        ───────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: pct(960, "h"),
            zIndex: 10,
            textAlign: "center",
          }}
        >
          <h3
            className="font-bold text-gray-700 inline-block"
            style={{ fontSize: "clamp(13px, 3.6vw, 16px)" }}
          >
            にゃんタスクでできること
          </h3>
        </div>

        {/* ─────────────────────────────────
            機能カードのテキスト（クリップボード/猫魚/本の下）
            features は y=999 開始、h=164.94 → 文字は 1170 付近
        ───────────────────────────────── */}
        <FeatureLabel x={43.48} w={177.69} title="やること管理" desc="タスクを整理して、毎日をもっとスッキリ！" />
        <FeatureLabel x={249.66} w={191.93} title="育成" desc="タスクをこなしてねこを育てよう！" />
        <FeatureLabel x={455.09} w={191.93} title="図鑑" desc="集めたねこを図鑑にコレクション！" />
      </div>
    </main>
  );
}

function FeatureLabel({
  x,
  w,
  title,
  desc,
}: {
  x: number;
  w: number;
  title: string;
  desc: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: pct(x, "w"),
        top: pct(1180, "h"),
        width: pct(w, "w"),
        zIndex: 10,
        textAlign: "center",
      }}
    >
      <p
        className="font-extrabold text-gray-800"
        style={{ fontSize: "clamp(11px, 2.8vw, 13px)" }}
      >
        {title}
      </p>
      <p
        className="text-gray-500 leading-tight mt-0.5"
        style={{ fontSize: "clamp(9px, 2.2vw, 11px)" }}
      >
        {desc}
      </p>
    </div>
  );
}
