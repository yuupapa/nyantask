"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import type { Cat } from "@/lib/types";
import { CAT_VISUAL_COUNT } from "@/lib/types";
import { generateRandomTraits } from "@/lib/cat-traits";
import {
  calculateDecay,
  applyFeed,
  getFriendshipLevel,
  getDaysSinceBorn,
} from "@/lib/cat";
import { adjustCurrency } from "@/app/_actions/currency";
import { revalidatePath } from "next/cache";

const PAW_REWARD_PER_LEVELUP = 3;
const SUMMON_DAYS_REQUIRED = 15;

/**
 * ユーザーの活動中の猫を取得。
 * なければ初回付与で新しい猫を生成（個性ランダム）。
 * 取得後、時間減衰を反映して DB を更新。
 */
export async function getOrCreateActiveCat(): Promise<Cat> {
  const profile = await requireAuth();
  const supabase = await createClient();

  // 既存の active 猫を取得
  const { data: existing } = await supabase
    .from("cats")
    .select(
      "id, user_id, name, visual_id, pattern, face, personality, rarity, hunger, mood, friendship_xp, is_active, is_runaway, born_at, last_decay_at, created_at"
    )
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .maybeSingle();

  let cat: Cat;
  if (existing) {
    cat = existing as Cat;
  } else {
    // 初回猫を付与
    const traits = generateRandomTraits();
    const visualId = Math.floor(Math.random() * CAT_VISUAL_COUNT) + 1;
    const { data: created, error: createError } = await supabase
      .from("cats")
      .insert({
        user_id: profile.id,
        visual_id: visualId,
        pattern: traits.pattern,
        face: traits.face,
        personality: traits.personality,
        rarity: traits.rarity,
      })
      .select(
        "id, user_id, name, visual_id, pattern, face, personality, rarity, hunger, mood, friendship_xp, is_active, is_runaway, born_at, last_decay_at, created_at"
      )
      .single();

    if (createError) {
      console.error("[cat/create] error:", createError);
      throw new Error(createError.message);
    }
    cat = created as Cat;
  }

  // 時間減衰を反映
  const decay = calculateDecay(cat.last_decay_at, cat.hunger, cat.mood);
  if (decay.decayedHours > 0) {
    const { data: updated, error: updateError } = await supabase
      .from("cats")
      .update({
        hunger: decay.hunger,
        mood: decay.mood,
        last_decay_at: new Date().toISOString(),
      })
      .eq("id", cat.id)
      .select(
        "id, user_id, name, visual_id, pattern, face, personality, rarity, hunger, mood, friendship_xp, is_active, is_runaway, born_at, last_decay_at, created_at"
      )
      .single();

    if (!updateError && updated) {
      cat = updated as Cat;
    }
  }

  return cat;
}

/**
 * 餌を1回与える（タスク完了時に呼ぶ）。
 * 戻り値で更新後の数値を返す（必要なら）。
 */
export async function feedActiveCat(): Promise<void> {
  const profile = await requireAuth();
  const supabase = await createClient();

  // 現在の active 猫を取得
  const { data: cat, error: fetchError } = await supabase
    .from("cats")
    .select("id, hunger, mood, friendship_xp")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .maybeSingle();

  if (fetchError) {
    console.error("[cat/feed] fetch error:", fetchError);
    return; // 失敗してもタスク自体は成功扱い（猫がない場合などをスキップ）
  }
  if (!cat) return;

  const next = applyFeed({
    hunger: cat.hunger,
    mood: cat.mood,
    friendship_xp: cat.friendship_xp,
  });

  const { error: updateError } = await supabase
    .from("cats")
    .update(next)
    .eq("id", cat.id);

  if (updateError) {
    console.error("[cat/feed] update error:", updateError);
    return;
  }

  // なかよしLv UP を検知してにくきゅうを付与
  const beforeLv = getFriendshipLevel(cat.friendship_xp);
  const afterLv = getFriendshipLevel(next.friendship_xp);
  if (afterLv > beforeLv) {
    const levelsUp = afterLv - beforeLv;
    await adjustCurrency({
      kind: "paw",
      amount: PAW_REWARD_PER_LEVELUP * levelsUp,
      reason: "friendship_levelup",
      relatedId: cat.id,
      note: `Lv ${beforeLv} → ${afterLv}`,
    });
  }
}

/**
 * 餌を取り消す（タスクの完了を取り消したとき）。
 * 経験値も -10 するが、にくきゅうの自動取消は行わない
 *  （一度貯まった paw はユーザーのもの。消費操作で減るのみ）
 */
export async function unfeedActiveCat(): Promise<void> {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { data: cat } = await supabase
    .from("cats")
    .select("id, hunger, mood, friendship_xp")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!cat) return;

  const HUNGER = 5;
  const MOOD = 3;
  const XP = 10;

  await supabase
    .from("cats")
    .update({
      hunger: Math.max(0, cat.hunger - HUNGER),
      mood: Math.max(0, cat.mood - MOOD),
      friendship_xp: Math.max(0, cat.friendship_xp - XP),
    })
    .eq("id", cat.id);
}

// ============================================================
// 猫の名前変更
// ============================================================
const MAX_CAT_NAME_LENGTH = 20;

export async function updateCatName(catId: string, newName: string): Promise<void> {
  const profile = await requireAuth();
  const name = newName.trim();
  if (!name) throw new Error("名前を入力してください");
  if (name.length > MAX_CAT_NAME_LENGTH) {
    throw new Error(`名前は${MAX_CAT_NAME_LENGTH}文字以内にしてください`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("cats")
    .update({ name })
    .eq("id", catId)
    .eq("user_id", profile.id);

  if (error) {
    console.error("[cat/rename] error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/cats");
}

// ============================================================
// なでなで（paw 消費でなかよし度を上げる）
// ============================================================
const PET_PAW_COST = 1;
const PET_MOOD_BOOST = 20;
const PET_XP_BOOST = 30;

export async function petCat(): Promise<void> {
  const profile = await requireAuth();
  const supabase = await createClient();

  if (profile.paw < PET_PAW_COST) {
    throw new Error(
      `にくきゅうが足りません（必要：${PET_PAW_COST}、残高：${profile.paw}）`
    );
  }

  const { data: cat } = await supabase
    .from("cats")
    .select("id, hunger, mood, friendship_xp")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!cat) {
    throw new Error("育てている猫がいません");
  }

  // 1. paw を消費
  await adjustCurrency({
    kind: "paw",
    amount: -PET_PAW_COST,
    reason: "other",
    relatedId: cat.id,
    note: "なでなで",
  });

  // 2. mood / xp 上昇
  const newMood = Math.min(100, cat.mood + PET_MOOD_BOOST);
  const newXp = cat.friendship_xp + PET_XP_BOOST;

  const { error: updateError } = await supabase
    .from("cats")
    .update({ mood: newMood, friendship_xp: newXp })
    .eq("id", cat.id);

  if (updateError) {
    console.error("[cat/pet] update error:", updateError);
    throw new Error(updateError.message);
  }

  // 3. Lv UP 検知 → paw 自動付与
  const beforeLv = getFriendshipLevel(cat.friendship_xp);
  const afterLv = getFriendshipLevel(newXp);
  if (afterLv > beforeLv) {
    await adjustCurrency({
      kind: "paw",
      amount: PAW_REWARD_PER_LEVELUP * (afterLv - beforeLv),
      reason: "friendship_levelup",
      relatedId: cat.id,
      note: `なでなでで Lv ${beforeLv} → ${afterLv}`,
    });
  }
}

// ============================================================
// 新しい猫を迎える（既存の active 猫は殿堂入り）
// ============================================================
export async function summonNewCat(): Promise<void> {
  const profile = await requireAuth();
  const supabase = await createClient();

  // 既存の active 猫を取得
  const { data: existing } = await supabase
    .from("cats")
    .select("id, born_at")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .maybeSingle();

  if (existing) {
    // 若猫以上か判定
    const days = getDaysSinceBorn(existing.born_at);
    if (days < SUMMON_DAYS_REQUIRED) {
      const remain = SUMMON_DAYS_REQUIRED - days;
      throw new Error(
        `現在の猫が若猫になるまで（${SUMMON_DAYS_REQUIRED}日）はあと ${remain} 日です`
      );
    }

    // 既存猫を殿堂入り
    const { error: updateError } = await supabase
      .from("cats")
      .update({ is_active: false })
      .eq("id", existing.id);

    if (updateError) {
      console.error("[cat/summon] retire error:", updateError);
      throw new Error(updateError.message);
    }
  }

  // 新しい猫を生成
  const traits = generateRandomTraits();
  const visualId = Math.floor(Math.random() * CAT_VISUAL_COUNT) + 1;
  const { error: insertError } = await supabase.from("cats").insert({
    user_id: profile.id,
    visual_id: visualId,
    pattern: traits.pattern,
    face: traits.face,
    personality: traits.personality,
    rarity: traits.rarity,
  });

  if (insertError) {
    console.error("[cat/summon] insert error:", insertError);
    throw new Error(insertError.message);
  }

  revalidatePath("/");
  revalidatePath("/cats");
}
