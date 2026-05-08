"use client";

import { motion } from "framer-motion";
import type { Cat, ShopItem, UserItem } from "@/lib/types";
import { PetCatButton } from "@/app/_components/PetCatButton";
import { CatTalkButton } from "@/app/_components/CatTalkButton";
import { CatNameEditor } from "@/app/_components/CatNameEditor";
import { CatSprite, type SpriteState } from "@/app/_components/CatSprite";
import {
  getStage,
  getDaysSinceBorn,
  STAGE_LABELS,
  getStatus,
  STATUS_LABELS,
  STATUS_EMOJI,
  xpProgress,
  getAppearance,
} from "@/lib/cat";
import { UseItemButton } from "./UseItemButton";

type UserItemWithShop = UserItem & { shop_item: ShopItem };

type Props = {
  cat: Cat;
  userItems: UserItemWithShop[];
  pawBalance: number;
  hasApiKey: boolean;
};

export function CatRoomClient({ cat, userItems, pawBalance, hasApiKey }: Props) {
  const stage = getStage(cat.born_at);
  const days = getDaysSinceBorn(cat.born_at);
  const status = getStatus(cat);
  const xp = xpProgress(cat.friendship_xp);

  const foodItems = userItems.filter((i) => i.shop_item.category === "food");
  const toyItems = userItems.filter((i) => i.shop_item.category === "toy");
  const furnitureItems = userItems.filter(
    (i) => i.shop_item.category === "furniture"
  );

  // ステータスから表情スプライトを決定
  const appearance = getAppearance({ friendshipLevel: xp.level, status });
  const spriteState: SpriteState =
    appearance === "sparkle" ? "sparkle"
    : status === "happy"    ? "happy"
    : status === "sad" || status === "sick" ? "sad"
    : "normal";

  return (
    <div className="space-y-4 pt-3">
      {/* ─── お部屋エリア ─── */}
      <div
        className="relative w-full rounded-3xl overflow-hidden shadow-md"
        style={{ height: 300 }}
      >
        {/* 背景：コージーな部屋 */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, #FFF0E0 0%, #FFE4C4 54%, #C8936A 55%, #B8845A 100%)",
          }}
        />

        {/* 窓 */}
        <div
          className="absolute"
          style={{
            top: 18,
            left: 20,
            width: 76,
            height: 76,
            background: "linear-gradient(135deg, #87CEEB 0%, #B0E2FF 100%)",
            borderRadius: 8,
            border: "4px solid #C8936A",
          }}
        >
          {/* 窓枠の十字 */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-full h-[3px] bg-[#C8936A]/60 rounded" />
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-[3px] h-full bg-[#C8936A]/60 rounded" />
          </div>
        </div>

        {/* 家具（置物）の絵文字 */}
        {furnitureItems.length > 0 && (
          <div
            className="absolute flex gap-1"
            style={{ right: 16, top: 20 }}
          >
            {furnitureItems.slice(0, 3).map((fi) => (
              <span key={fi.id} className="text-2xl drop-shadow">
                🪑
              </span>
            ))}
          </div>
        )}

        {/* 猫（スプライトアニメ） */}
        <div
          className="absolute"
          style={{ bottom: 30, left: "50%", transform: "translateX(-50%)" }}
        >
          <CatSprite
            visualId={cat.visual_id ?? 1}
            state="idle"
            height={220}
          />
        </div>

        {/* ステータスバッジ */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full shadow-sm ${statusBadgeClass(status)}`}
          >
            {STATUS_EMOJI[status]} {STATUS_LABELS[status]}
          </span>
        </div>
      </div>

      {/* ─── 名前 + ステージ ─── */}
      <div className="bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-400 mb-0.5">
            {STAGE_LABELS[stage]}（{days}日目）
          </div>
          <CatNameEditor catId={cat.id} initialName={cat.name} />
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">なかよし</div>
          <div className="text-2xl font-black text-nyan-pink-deep">
            Lv.{xp.level}
          </div>
        </div>
      </div>

      {/* ─── ステータスバー ─── */}
      <div className="bg-white rounded-2xl px-4 py-4 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
          ステータス
        </h3>
        <StatBar
          label="🍣 満腹度"
          value={cat.hunger}
          max={100}
          color="bg-orange-400"
        />
        <StatBar
          label="✨ 機嫌"
          value={cat.mood}
          max={100}
          color="bg-pink-400"
        />
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-700 font-semibold">
              💗 なかよし Lv.{xp.level}
            </span>
            <span className="text-xs text-gray-500">
              {xp.current} / {xp.needed} XP
            </span>
          </div>
          <div className="w-full bg-gray-200/80 rounded-full h-2 overflow-hidden">
            <div
              className="bg-nyan-pink-deep h-2 rounded-full transition-all"
              style={{ width: `${xp.pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ─── アクション ─── */}
      <div className="bg-white rounded-2xl px-4 py-4 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
          アクション
        </h3>
        <PetCatButton pawBalance={pawBalance} />
        <p className="text-[11px] text-gray-400 text-center -mt-1">
          🐾 1 消費で 機嫌 +20、なかよし経験値 +30
        </p>
        <CatTalkButton hasApiKey={hasApiKey} />
      </div>

      {/* ─── 所持アイテム ─── */}
      {(foodItems.length > 0 || toyItems.length > 0 || furnitureItems.length > 0) && (
        <div className="bg-white rounded-2xl px-4 py-4 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            🎒 所持アイテム
          </h3>

          {foodItems.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2">
                🍽️ ごはん
              </div>
              <div className="space-y-2">
                {foodItems.map((item) => (
                  <UseItemButton
                    key={item.id}
                    itemId={item.item_id}
                    name={item.shop_item.name}
                    quantity={item.quantity}
                    emoji="🍣"
                    label="あげる"
                  />
                ))}
              </div>
            </div>
          )}

          {toyItems.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2">
                🧸 おもちゃ
              </div>
              <div className="space-y-2">
                {toyItems.map((item) => (
                  <UseItemButton
                    key={item.id}
                    itemId={item.item_id}
                    name={item.shop_item.name}
                    quantity={item.quantity}
                    emoji="🎪"
                    label="遊ぶ"
                  />
                ))}
              </div>
            </div>
          )}

          {furnitureItems.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2">
                🪑 インテリア
              </div>
              <div className="space-y-2">
                {furnitureItems.map((item) => (
                  <UseItemButton
                    key={item.id}
                    itemId={item.item_id}
                    name={item.shop_item.name}
                    quantity={item.quantity}
                    emoji="🪑"
                    label="置く"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* アイテムがない場合 */}
      {foodItems.length === 0 && toyItems.length === 0 && furnitureItems.length === 0 && (
        <div className="bg-white rounded-2xl px-4 py-4 shadow-sm text-center text-sm text-gray-400">
          <p>アイテムがありません</p>
          <p className="text-xs mt-1 text-nyan-pink-deep font-semibold">
            ショップで購入してみよう！
          </p>
        </div>
      )}
    </div>
  );
}

function StatBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-700 font-semibold">{label}</span>
        <span className="text-xs text-gray-500">
          {value} / {max}
        </span>
      </div>
      <div className="w-full bg-gray-200/80 rounded-full h-2 overflow-hidden">
        <div
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "happy":
      return "bg-green-100 text-green-700";
    case "normal":
      return "bg-blue-100 text-blue-700";
    case "sad":
      return "bg-yellow-100 text-yellow-700";
    case "sick":
      return "bg-orange-100 text-orange-700";
    case "runaway":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}
