"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useItem } from "@/app/_actions/shop";

type Props = {
  itemId: string;
  name: string;
  quantity: number;
  emoji: string;
  label: string;
};

export function UseItemButton({ itemId, name, quantity, emoji, label }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleUse = () => {
    startTransition(async () => {
      try {
        const msg = await useItem(itemId);
        router.refresh();
        alert(msg);
      } catch (err) {
        alert(err instanceof Error ? err.message : "失敗しました");
      }
    });
  };

  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        <div>
          <div className="text-sm font-medium text-gray-700">{name}</div>
          <div className="text-xs text-gray-400">× {quantity}</div>
        </div>
      </div>
      <button
        onClick={handleUse}
        disabled={isPending}
        className="bg-nyan-pink-deep text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-80 transition disabled:opacity-50"
      >
        {isPending ? "…" : label}
      </button>
    </div>
  );
}
