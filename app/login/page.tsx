"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import Image from "next/image";

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
      {/* 背景デコレーション — 肉球・魚 */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <span className="absolute top-[6%] left-[8%] text-2xl opacity-15 rotate-[-15deg]">🐾</span>
        <span className="absolute top-[12%] right-[10%] text-xl opacity-10 rotate-[20deg]">🐟</span>
        <span className="absolute top-[35%] left-[3%] text-lg opacity-10 rotate-[25deg]">🐾</span>
        <span className="absolute top-[50%] right-[5%] text-2xl opacity-10 rotate-[-20deg]">🐾</span>
        <span className="absolute bottom-[30%] left-[12%] text-lg opacity-10 rotate-[10deg]">🐟</span>
        <span className="absolute bottom-[15%] right-[15%] text-xl opacity-15 rotate-[-30deg]">🐾</span>
        <span className="absolute top-[22%] left-[45%] text-lg opacity-8 rotate-[35deg]">🐾</span>
        <span className="absolute bottom-[8%] left-[30%] text-xl opacity-10 rotate-[5deg]">🐾</span>
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen px-6">
        {/* 上部 — 猫イラスト散りばめ + キャッチコピー */}
        <div className="w-full max-w-xs mx-auto pt-10 relative">
          {/* 散りばめ猫たち */}
          <div className="absolute -top-2 -left-4 w-16 h-16 rotate-[-12deg]">
            <Image src="/cats/cat-003.png" alt="" width={64} height={64} className="drop-shadow-md" />
          </div>
          <div className="absolute -top-4 right-2 w-14 h-14 rotate-[8deg]">
            <Image src="/cats/cat-007.png" alt="" width={56} height={56} className="drop-shadow-md" />
          </div>
          <div className="absolute top-12 -left-6 w-12 h-12 rotate-[15deg]">
            <Image src="/cats/cat-012.png" alt="" width={48} height={48} className="drop-shadow-sm" />
          </div>
          <div className="absolute top-10 -right-4 w-12 h-12 rotate-[-10deg]">
            <Image src="/cats/cat-021.png" alt="" width={48} height={48} className="drop-shadow-sm" />
          </div>

          {/* キャッチコピー */}
          <div className="text-center pt-6 pb-2">
            <p className="text-xl text-gray-600 font-bold tracking-wide">
              ToDoしながら、
            </p>
            <h1 className="text-4xl font-extrabold text-nyan-pink-deep leading-tight mt-1">
              ねこ集め！
            </h1>
          </div>
        </div>

        {/* ロゴ */}
        <div className="text-center mt-4 mb-2">
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-800">
            にゃんタスク
          </h2>
          <p className="text-sm text-gray-400 mt-1 tracking-widest">
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
            ログインすると、
            <span className="underline">利用規約</span>と
            <span className="underline">プライバシーポリシー</span>に
            同意したことになります
          </p>
        </div>

        {/* 下部 — にゃんタスクでできること */}
        <div className="w-full max-w-sm mx-auto mt-auto pb-10 pt-8">
          <div className="border-t border-gray-200/60 pt-6">
            <h3 className="text-center text-sm font-bold text-gray-500 mb-4">
              にゃんタスクでできること
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <FeatureCard
                catId={5}
                title="やること管理"
                desc="タスクを管理して毎日コツコツ"
              />
              <FeatureCard
                catId={18}
                title="育成"
                desc="タスク達成で猫が成長！"
              />
              <FeatureCard
                catId={42}
                title="図鑑"
                desc="出会った猫をコレクション"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  catId,
  title,
  desc,
}: {
  catId: number;
  title: string;
  desc: string;
}) {
  const src = `/cats/cat-${String(catId).padStart(3, "0")}.png`;
  return (
    <div className="bg-white/70 rounded-2xl p-3 text-center shadow-sm">
      <div className="w-12 h-12 mx-auto mb-1">
        <Image src={src} alt={title} width={48} height={48} className="object-contain" />
      </div>
      <p className="text-xs font-bold text-gray-700">{title}</p>
      <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{desc}</p>
    </div>
  );
}
