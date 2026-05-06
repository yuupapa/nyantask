"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { generateCatMessage } from "@/app/_actions/gemini";

type Props = {
  hasApiKey: boolean;
};

export function CatTalkButton({ hasApiKey }: Props) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTalk = () => {
    if (!hasApiKey) return;
    setError(null);
    startTransition(async () => {
      try {
        const msg = await generateCatMessage();
        setMessage(msg);
      } catch (err) {
        setError(err instanceof Error ? err.message : "失敗しました");
        setMessage(null);
      }
    });
  };

  return (
    <div className="space-y-2">
      {!hasApiKey ? (
        <Link
          href="/settings"
          className="block w-full px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800 text-center hover:bg-yellow-100 transition"
        >
          💡 設定画面でGemini APIキーを登録すると、猫が話しかけてくれます
        </Link>
      ) : (
        <button
          onClick={handleTalk}
          disabled={isPending}
          className="w-full px-4 py-2 bg-white border-2 border-nyan-pink-deep text-nyan-pink-deep rounded-full hover:bg-nyan-pink-deep/10 transition font-semibold text-sm disabled:opacity-50"
        >
          {isPending ? "考え中..." : "💬 話しかける"}
        </button>
      )}

      {message && (
        <div className="relative bg-white rounded-2xl shadow-md border-2 border-nyan-pink p-4 text-sm">
          {/* 吹き出しの三角 */}
          <div className="absolute -top-2 left-8 w-4 h-4 bg-white border-l-2 border-t-2 border-nyan-pink rotate-45" />
          <p className="relative">{message}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-xs text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
