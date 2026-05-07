"use client";

import { useState } from "react";
import type { ShopItem, ShopCategory, UserItem } from "@/lib/types";
import {
  SHOP_CATEGORIES,
  SHOP_CATEGORY_LABELS,
  SHOP_CATEGORY_EMOJI,
} from "@/lib/types";
import { ShopItemCard } from "./ShopItemCard";
import { purchaseFood, purchaseItem } from "@/app/_actions/shop";

type Props = {
  items: ShopItem[];
  coinBalance: number;
  userItems: (UserItem & { shop_item: ShopItem })[];
};

export function ShopTabs({ items, coinBalance, userItems }: Props) {
  const [activeTab, setActiveTab] = useState<ShopCategory>("food");

  const filteredItems = items.filter((i) => i.category === activeTab);

  const availableTabs = SHOP_CATEGORIES.filter((cat) =>
    items.some((i) => i.category === cat)
  );

  function getOwnedQuantity(itemId: string): number {
    const found = userItems.find((ui) => ui.item_id === itemId);
    return found?.quantity ?? 0;
  }

  function handlePurchase(item: ShopItem): (itemId: string) => Promise<string> {
    return item.category === "food" ? purchaseFood : purchaseItem;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {availableTabs.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              activeTab === cat
                ? "bg-nyan-pink-deep text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {SHOP_CATEGORY_EMOJI[cat]} {SHOP_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredItems.map((item) => (
          <ShopItemCard
            key={item.id}
            item={item}
            coinBalance={coinBalance}
            ownedQuantity={getOwnedQuantity(item.id)}
            onPurchase={handlePurchase(item)}
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <p className="text-center text-gray-400 py-8">
          このカテゴリの商品はまだありません
        </p>
      )}
    </div>
  );
}
