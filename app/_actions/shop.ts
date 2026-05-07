"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { adjustCurrency } from "@/app/_actions/currency";
import { revalidatePath } from "next/cache";
import type { ShopItem, UserItem } from "@/lib/types";

export async function getShopItems(): Promise<ShopItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shop_items")
    .select("*")
    .order("category")
    .order("sort_order");

  if (error) {
    console.error("[shop/getItems] error:", error);
    return [];
  }
  return data as ShopItem[];
}

export async function getUserItems(): Promise<
  (UserItem & { shop_item: ShopItem })[]
> {
  const profile = await requireAuth();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_items")
    .select("*, shop_item:shop_items(*)")
    .eq("user_id", profile.id)
    .gt("quantity", 0);

  if (error) {
    console.error("[shop/getUserItems] error:", error);
    return [];
  }
  return data as (UserItem & { shop_item: ShopItem })[];
}

export async function purchaseFood(itemId: string): Promise<string> {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { data: item, error: itemError } = await supabase
    .from("shop_items")
    .select("*")
    .eq("id", itemId)
    .eq("category", "food")
    .single();

  if (itemError || !item) {
    throw new Error("商品が見つかりません");
  }

  if (profile.coin < item.price) {
    throw new Error(
      `コインが足りません（必要: ${item.price}🪙、残高: ${profile.coin}🪙）`
    );
  }

  const { data: cat } = await supabase
    .from("cats")
    .select("id, hunger")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!cat) {
    throw new Error("育てている猫がいません");
  }

  await adjustCurrency({
    kind: "coin",
    amount: -item.price,
    reason: "other",
    relatedId: itemId,
    note: `shop:${item.slug}`,
  });

  const newHunger = Math.min(100, cat.hunger + item.effect_value);
  const { error: updateError } = await supabase
    .from("cats")
    .update({ hunger: newHunger })
    .eq("id", cat.id);

  if (updateError) {
    console.error("[shop/purchaseFood] cat update error:", updateError);
    throw new Error("猫の状態更新に失敗しました");
  }

  revalidatePath("/");
  revalidatePath("/shop");
  return `${item.name}をあげました！ 満腹度 +${item.effect_value}`;
}

export async function purchaseItem(itemId: string): Promise<string> {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { data: item, error: itemError } = await supabase
    .from("shop_items")
    .select("*")
    .eq("id", itemId)
    .single();

  if (itemError || !item) {
    throw new Error("商品が見つかりません");
  }
  if (item.category === "food") {
    throw new Error("餌は purchaseFood を使ってください");
  }

  if (profile.coin < item.price) {
    throw new Error(
      `コインが足りません（必要: ${item.price}🪙、残高: ${profile.coin}🪙）`
    );
  }

  await adjustCurrency({
    kind: "coin",
    amount: -item.price,
    reason: "other",
    relatedId: itemId,
    note: `shop:${item.slug}`,
  });

  const { data: existing } = await supabase
    .from("user_items")
    .select("id, quantity")
    .eq("user_id", profile.id)
    .eq("item_id", itemId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("user_items")
      .update({ quantity: existing.quantity + 1 })
      .eq("id", existing.id);
  } else {
    await supabase.from("user_items").insert({
      user_id: profile.id,
      item_id: itemId,
      quantity: 1,
    });
  }

  revalidatePath("/shop");
  return `${item.name}を購入しました！`;
}

export async function useItem(itemId: string): Promise<string> {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { data: userItem, error: uiError } = await supabase
    .from("user_items")
    .select("id, quantity, item_id")
    .eq("user_id", profile.id)
    .eq("item_id", itemId)
    .gt("quantity", 0)
    .maybeSingle();

  if (uiError || !userItem) {
    throw new Error("アイテムを持っていません");
  }

  const { data: item } = await supabase
    .from("shop_items")
    .select("*")
    .eq("id", itemId)
    .single();

  if (!item) {
    throw new Error("商品情報が見つかりません");
  }

  const { data: cat } = await supabase
    .from("cats")
    .select("id, mood, friendship_xp")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!cat) {
    throw new Error("育てている猫がいません");
  }

  const updates: Record<string, number> = {};
  const effects: string[] = [];

  if (item.effect_type === "hunger") {
    updates.hunger = Math.min(100, (cat as Record<string, number>).hunger + item.effect_value);
    effects.push(`満腹度 +${item.effect_value}`);
  }
  if (item.effect_type === "mood" || item.slug === "toy-catnip") {
    updates.mood = Math.min(100, cat.mood + item.effect_value);
    effects.push(`機嫌 +${item.effect_value}`);
  }
  if (item.effect_type === "xp" || item.slug === "toy-catnip") {
    const xpBonus = item.effect_type === "xp" ? item.effect_value : 30;
    updates.friendship_xp = cat.friendship_xp + xpBonus;
    effects.push(`経験値 +${xpBonus}`);
  }

  const message = `${item.name}を使いました！ ${effects.join("、")}`;

  if (Object.keys(updates).length > 0) {
    const { error: catError } = await supabase
      .from("cats")
      .update(updates)
      .eq("id", cat.id);

    if (catError) {
      console.error("[shop/useItem] cat update error:", catError);
      throw new Error("猫の状態更新に失敗しました");
    }
  }

  if (userItem.quantity <= 1) {
    await supabase.from("user_items").delete().eq("id", userItem.id);
  } else {
    await supabase
      .from("user_items")
      .update({ quantity: userItem.quantity - 1 })
      .eq("id", userItem.id);
  }

  revalidatePath("/");
  revalidatePath("/shop");
  return message;
}
