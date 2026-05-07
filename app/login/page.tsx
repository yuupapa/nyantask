"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import Image from "next/image";
import {
  PawSticker,
  StarSticker,
  FishSticker,
  YarnSticker,
  CatStickerFrame,
} from "@/app/_components/Stickers";

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
      <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col items-center px-4">
        {/* ─────────────────────────────────
            上部：吹き出し + 装飾ステッカー
        ───────────────────────────────── */}
        <div className="relative w-full pt-12 pb-2">
          {/* 散りばめステッカー（吹き出しの周り） */}
          <PawSticker size={48} rotate={-20} className="absolute top-6 left-2" color="#FFB5C5" />
          <StarSticker size={32} rotate={15} className="absolute top-2 left-20" color="#FFD668" />
          <YarnSticker size={42} rotate={0} className="absolute top-4 right-12" />
          <StarSticker size={26} rotate={-12} className="absolute top-20 right-2" color="#A8D8FF" />
          <PawSticker size={36} rotate={20} className="absolute top-32 right-2" color="#B5E8D5" />
          <StarSticker size={22} rotate={25} className="absolute top-28 left-1" color="#B5E8D5" />

          {/* 吹き出し本体 */}
          <div className="relative mx-auto w-[78%] mt-2">
            <div className="bubble-pink text-center">
              <p className="text-lg font-extrabold tracking-wide" style={{ color: "#FFE799" }}>
                ToDoしながら、
              </p>
              <p className="text-3xl font-extrabold tracking-wider mt-1" style={{ color: "#fff" }}>
                ねこ集め！
              </p>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────
            中央：猫イラスト散りばめ + ロゴ
        ───────────────────────────────── */}
        <div className="relative w-full mt-10 mb-2">
          {/* 周辺の猫ステッカーたち（左右） */}
          <div className="absolute left-0 top-2">
            <CatStickerFrame size={68} rotate={-8}>
              <Image src="/cats/cat-005.png" alt="" width={68} height={68} className="object-contain" />
            </CatStickerFrame>
          </div>

          <div className="absolute right-0 top-1">
            <CatStickerFrame size={64} rotate={10}>
              <Image src="/cats/cat-018.png" alt="" width={64} height={64} className="object-contain" />
            </CatStickerFrame>
          </div>

          <FishSticker size={40} rotate={-15} className="absolute top-12 left-16" color="#FFB466" />
          <FishSticker size={38} rotate={10} className="absolute top-14 right-20" color="#5DAEE8" />

          {/* 真ん中の覗き込む黒猫 */}
          <div className="flex justify-center pt-12">
            <CatStickerFrame size={120} rotate={0}>
              <Image src="/cats/cat-002.png" alt="" width={120} height={120} className="object-contain" />
            </CatStickerFrame>
          </div>

          {/* 「にゃんタスク」ロゴ */}
          <div className="text-center mt-3">
            <h1 className="text-5xl font-black tracking-tight inline-block" style={{ fontFamily: "'Hiragino Maru Gothic ProN', 'Yu Gothic UI', sans-serif" }}>
              <span style={{ color: "#FF8FA8" }}>にゃん</span>
              <span style={{ color: "#5DAEE8" }}>タスク</span>
            </h1>
            <div className="flex justify-center mt-3">
              <span className="ribbon text-xs">ToDo × 猫育成アプリ</span>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────
            ログインボタン
        ───────────────────────────────── */}
        <div className="w-full max-w-xs mt-8">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full px-6 py-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 border border-gray-100"
          >
            <svg width="22" height="22" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
              <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
            </svg>
            <span className="font-bold text-gray-800 text-base">
              {loading ? "ログイン中..." : "Googleでログイン"}
            </span>
          </button>

          {error && (
            <p className="mt-3 text-red-600 text-sm text-center">エラー: {error}</p>
          )}

          <p className="mt-3 text-[11px] text-gray-500 text-center leading-relaxed flex items-center justify-center gap-1">
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
            下部：にゃんタスクでできること
        ───────────────────────────────── */}
        <div className="w-full mt-auto pt-8 pb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-nyan-pink-deep">✿</span>
            <h2 className="text-base font-bold text-gray-700">にゃんタスクでできること</h2>
            <span className="text-nyan-pink-deep">✿</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <FeatureCard
              catId={5}
              icon="📋"
              title="やること管理"
              desc="タスクを整理して、毎日をもっとスッキリ！"
            />
            <FeatureCard
              catId={18}
              icon="🐟"
              title="育成"
              desc="タスクをこなしてねこを育てよう！"
            />
            <FeatureCard
              catId={42}
              icon="📖"
              title="図鑑"
              desc="集めたねこを図鑑にコレクション！"
            />
          </div>
          <PawSticker size={28} rotate={-15} className="absolute bottom-6 right-4" color="#B5E8D5" />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  catId,
  icon,
  title,
  desc,
}: {
  catId: number;
  icon: string;
  title: string;
  desc: string;
}) {
  const src = `/cats/cat-${String(catId).padStart(3, "0")}.png`;
  return (
    <div className="bg-white rounded-3xl p-3 shadow-md border border-gray-100">
      <div className="relative h-20 flex items-center justify-center">
        <span className="absolute top-0 left-1 text-2xl z-10">{icon}</span>
        <CatStickerFrame size={56}>
          <Image src={src} alt={title} width={56} height={56} className="object-contain" />
        </CatStickerFrame>
      </div>
      <p className="text-xs font-extrabold text-gray-800 mt-1 text-center">{title}</p>
      <p className="text-[10px] text-gray-500 mt-1 text-center leading-tight">{desc}</p>
    </div>
  );
}
