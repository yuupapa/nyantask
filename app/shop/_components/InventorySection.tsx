"use client";

import { useState } from "react";
import type { ShopItem, UserItem } from "@/lib/types";
import { useItem } from "@/app/_actions/shop";

type Props = {
  items: (UserItem & { shop_item: ShopItem })[];
};

export function InventorySection({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-gray-800">🎒 もちもの</h2>
      <div className="grid grid-cols-1 gap-3">
        {items.map((ui) => (
          <InventoryRow key={ui.id} userItem={ui} />
        ))}
      </div>
    </section>
  );
}

function InventoryRow({
  userItem,
}: {
  userItem: UserItem & { shop_item: ShopItem };
}) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const item = userItem.shop_item;

  const handleUse = async () => {
    setIsPending(true);
    setMessage(null);
    try {
      const msg = await useItem(userItem.item_id);
      setMessage(msg);
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "使用に失敗しました");
    } finally {
      setIsPending(false);
    }
  };

  const canUse = item.category === "toy";

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-3 flex items-center gap-3">
      <div className="flex-1">
        <span className="font-semibold text-gray-800">{item.name}</span>
        <span className="ml-2 text-xs text-gray-500">x{userItem.quantity}</span>
      </div>
      {canUse && (
        <button
          onClick={handleUse}
          disabled={isPending}
          className="px-4 py-1.5 bg-nyan-pink-deep text-white text-sm rounded-lg font-semibold hover:opacity-80 disabled:opacity-50"
        >
          {isPending ? "..." : "使う"}
        </button>
      )}
      {message && (
        <span className="text-xs text-green-600 font-semibold">{message}</span>
      )}
    </div>
  );
}
