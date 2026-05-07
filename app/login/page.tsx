"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

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
    <main className="min-h-screen bg-nyan-cream relative overflow-hidden">
      {/* 背景デコレーション — 猫の足跡 */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-[0.08]">
        <span className="absolute top-[8%] left-[10%] text-4xl rotate-[-20deg]">🐾</span>
        <span className="absolute top-[15%] right-[12%] text-3xl rotate-[15deg]">🐾</span>
        <span className="absolute top-[45%] left-[5%] text-2xl rotate-[30deg]">🐾</span>
        <span className="absolute top-[60%] right-[8%] text-3xl rotate-[-10deg]">🐾</span>
        <span className="absolute bottom-[25%] left-[15%] text-2xl rotate-[20deg]">🐾</span>
        <span className="absolute bottom-[10%] right-[20%] text-4xl rotate-[-25deg]">🐾</span>
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen">
        {/* 上部 — 猫デコレーション */}
        <div className="w-full max-w-sm mx-auto pt-12 px-4 relative">
          <div className="flex justify-center gap-3 mb-2">
            <span className="text-4xl animate-bounce" style={{ animationDelay: "0ms", animationDuration: "2s" }}>🐱</span>
            <span className="text-3xl animate-bounce" style={{ animationDelay: "300ms", animationDuration: "2.2s" }}>😺</span>
            <span className="text-4xl animate-bounce" style={{ animationDelay: "600ms", animationDuration: "1.8s" }}>🐈</span>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-8">
          {/* キャッチコピー */}
          <div className="text-center mb-6">
            <p className="text-lg text-gray-600 font-medium tracking-wide">
              ToDoしながら、
            </p>
            <h1 className="text-4xl font-extrabold text-nyan-pink-deep leading-tight">
              ねこ集め！
            </h1>
          </div>

          {/* NekoTask ロゴ */}
          <div className="text-center mb-2">
            <h2 className="text-5xl font-extrabold tracking-tight">
              <span className="text-teal-500">Neko</span>
              <span className="text-orange-400">Task</span>
            </h2>
            <p className="text-sm text-gray-500 mt-1 tracking-widest">
              ToDo × 猫育成アプリ
            </p>
          </div>

          {/* Google ログインボタン */}
          <div className="mt-8 w-full max-w-xs">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full px-6 py-3.5 bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path
                  fill="#FFC107"
                  d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                />
                <path
                  fill="#FF3D00"
                  d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                />
              </svg>
              <span className="font-semibold text-gray-700">
                {loading ? "ログイン中..." : "Googleでログイン"}
              </span>
            </button>

            {error && (
              <p className="mt-4 text-red-600 text-sm text-center">
                エラー: {error}
              </p>
            )}

            <p className="mt-3 text-[10px] text-gray-400 text-center leading-relaxed">
              ログインすると利用規約とプライバシーポリシーに
              <br />
              同意したことになります
            </p>
          </div>
        </div>

        {/* 下部 — NekoTaskでできること */}
        <div className="w-full max-w-sm mx-auto px-6 pb-10">
          <div className="border-t border-gray-200/60 pt-6">
            <h3 className="text-center text-sm font-bold text-gray-600 mb-4">
              NekoTaskでできること
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <FeatureCard emoji="📝" title="やること管理" desc="タスクを管理して毎日コツコツ" />
              <FeatureCard emoji="🐱" title="育成" desc="タスク達成で猫が成長！" />
              <FeatureCard emoji="📖" title="図鑑" desc="出会った猫をコレクション" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  emoji,
  title,
  desc,
}: {
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white/70 rounded-2xl p-3 text-center shadow-sm">
      <span className="text-2xl">{emoji}</span>
      <p className="text-xs font-bold text-gray-700 mt-1">{title}</p>
      <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{desc}</p>
    </div>
  );
}
