"use client";

import { useState } from "react";
import type { ShopItem } from "@/lib/types";

type Props = {
  item: ShopItem;
  coinBalance: number;
  ownedQuantity: number;
  onPurchase: (itemId: string) => Promise<string>;
};

export function ShopItemCard({
  item,
  coinBalance,
  ownedQuantity,
  onPurchase,
}: Props) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canAfford = coinBalance >= item.price;

  const handlePurchase = async () => {
    setIsPending(true);
    setMessage(null);
    try {
      const msg = await onPurchase(item.id);
      setMessage(msg);
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "購入に失敗しました");
    } finally {
      setIsPending(false);
    }
  };

  const effectLabel =
    item.effect_type === "hunger"
      ? `満腹度 +${item.effect_value}`
      : item.effect_type === "mood"
        ? `機嫌 +${item.effect_value}`
        : item.effect_type === "xp"
          ? `経験値 +${item.effect_value}`
          : "";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-gray-800">{item.name}</h3>
          {item.description && (
            <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
          )}
        </div>
        {ownedQuantity > 0 && item.category !== "food" && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
            x{ownedQuantity}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 text-sm">
        <span className="font-semibold text-yellow-700">🪙 {item.price}</span>
        {effectLabel && (
          <span className="text-gray-500">{effectLabel}</span>
        )}
      </div>

      <button
        onClick={handlePurchase}
        disabled={isPending || !canAfford}
        className={`mt-1 w-full py-2 rounded-xl text-sm font-semibold transition ${
          canAfford
            ? "bg-nyan-pink-deep text-white hover:opacity-80"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        } disabled:opacity-50`}
      >
        {isPending
          ? "処理中..."
          : !canAfford
            ? "コイン不足"
            : item.category === "food"
              ? "🍽️ あげる"
              : "🛒 買う"}
      </button>

      {message && (
        <p
          className={`text-xs text-center font-semibold ${
            message.includes("足りません") || message.includes("失敗")
              ? "text-red-600"
              : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
