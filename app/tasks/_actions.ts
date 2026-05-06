"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getTodayDate, getLastNDates } from "@/lib/date";
import { feedActiveCat, unfeedActiveCat } from "@/app/_actions/cat";
import { adjustCurrency } from "@/app/_actions/currency";

const FISH_PER_TASK = 2;
const FISH_PERFECT_BONUS = 5;
const RARE_FISH_CHANCE = 0.15;     // 15% でレアボーナス発生
const RARE_FISH_BONUS = 5;
const RARE_PAW_CHANCE = 0.30;      // レアボーナス時、さらに 30% で paw も出る
const RARE_PAW_BONUS = 1;
const STREAK_DAYS = 7;
const STREAK_PAW_BONUS = 5;

const MAX_TITLE_LENGTH = 200;

export type ToggleResult = {
  perfect: boolean;
  rareFish: number;
  rarePaw: number;
  streakPaw: number;
};

function validateTitle(title: string | null | undefined): string {
  const t = (title ?? "").trim();
  if (!t) throw new Error("タイトルを入力してください");
  if (t.length > MAX_TITLE_LENGTH) {
    throw new Error(`タイトルは${MAX_TITLE_LENGTH}文字以内にしてください`);
  }
  return t;
}

export async function addRoutineTask(formData: FormData) {
  const profile = await requireAuth();
  const title = validateTitle(formData.get("title") as string);

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    user_id: profile.id,
    title,
    type: "routine",
  });
  if (error) {
    console.error("[tasks/addRoutine] error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/tasks");
}

export async function addDailyTask(formData: FormData) {
  const profile = await requireAuth();
  const title = validateTitle(formData.get("title") as string);

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    user_id: profile.id,
    title,
    type: "daily",
    for_date: getTodayDate(),
  });
  if (error) {
    console.error("[tasks/addDaily] error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/tasks");
}

export async function deleteTask(taskId: string) {
  const profile = await requireAuth();

  const supabase = await createClient();
  // RLS でも本人のみ削除可だが、念のため明示的に user_id チェック
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", profile.id);

  if (error) {
    console.error("[tasks/delete] error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/tasks");
}

export async function toggleTaskCompletion(
  taskId: string,
  currentlyCompleted: boolean
): Promise<ToggleResult> {
  const profile = await requireAuth();
  const today = getTodayDate();

  const supabase = await createClient();

  if (currentlyCompleted) {
    // === 削除前の状態を記録（パーフェクトボーナス取消判定のため） ===
    const { count: beforeCompletedCount } = await supabase
      .from("task_completions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("for_date", today);

    const { count: totalActiveTasks } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .is("archived_at", null)
      .or(`type.eq.routine,for_date.eq.${today}`);

    const wasPerfect =
      !!beforeCompletedCount &&
      !!totalActiveTasks &&
      beforeCompletedCount === totalActiveTasks;

    // === 完了 → 未完了：今日の completions レコードを削除 ===
    const { error } = await supabase
      .from("task_completions")
      .delete()
      .eq("task_id", taskId)
      .eq("user_id", profile.id)
      .eq("for_date", today);
    if (error) {
      console.error("[tasks/uncomplete] error:", error);
      throw new Error(error.message);
    }

    // 餌を取り消す（猫がいれば、Lv DOWN なら paw も自動取消）
    await unfeedActiveCat();

    // おさかなを取り消す
    await adjustCurrency({
      kind: "fish",
      amount: -FISH_PER_TASK,
      reason: "task_uncomplete",
      relatedId: taskId,
    });

    // 削除前が100%達成だったら、パーフェクトボーナスも取り消す
    if (wasPerfect) {
      await adjustCurrency({
        kind: "fish",
        amount: -FISH_PERFECT_BONUS,
        reason: "task_uncomplete",
        note: `perfect_bonus_revoke ${today}`,
      });
    }

    revalidatePath("/tasks");
    revalidatePath("/");
    return { perfect: false, rareFish: 0, rarePaw: 0, streakPaw: 0 };
  } else {
    // 未完了 → 完了
    const { error } = await supabase.from("task_completions").insert({
      task_id: taskId,
      user_id: profile.id,
      for_date: today,
    });
    if (error) {
      console.error("[tasks/complete] error:", error);
      throw new Error(error.message);
    }
    // 餌を与える（猫がいれば）
    await feedActiveCat();
    // おさかな付与
    await adjustCurrency({
      kind: "fish",
      amount: FISH_PER_TASK,
      reason: "task_complete",
      relatedId: taskId,
    });

    // 達成率100%ボーナス判定（このタスク完了で全完になったか）
    const { count: totalActiveTasks } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .is("archived_at", null)
      .or(`type.eq.routine,for_date.eq.${today}`);

    const { count: todayCompletedCount } = await supabase
      .from("task_completions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("for_date", today);

    let perfect = false;
    if (
      totalActiveTasks &&
      todayCompletedCount &&
      totalActiveTasks > 0 &&
      todayCompletedCount === totalActiveTasks
    ) {
      // 全タスク完了：パーフェクトボーナス
      await adjustCurrency({
        kind: "fish",
        amount: FISH_PERFECT_BONUS,
        reason: "daily_perfect_bonus",
        note: today,
      });
      perfect = true;
    }

    // レア報酬枠（タスク完了のたびに抽選）
    let rareFish = 0;
    let rarePaw = 0;
    if (Math.random() < RARE_FISH_CHANCE) {
      rareFish = RARE_FISH_BONUS;
      await adjustCurrency({
        kind: "fish",
        amount: RARE_FISH_BONUS,
        reason: "task_complete",
        relatedId: taskId,
        note: "rare_bonus",
      });
      if (Math.random() < RARE_PAW_CHANCE) {
        rarePaw = RARE_PAW_BONUS;
        await adjustCurrency({
          kind: "paw",
          amount: RARE_PAW_BONUS,
          reason: "task_complete",
          relatedId: taskId,
          note: "rare_bonus",
        });
      }
    }

    // ストリークボーナス：直近 7 日すべてに 1 件以上の完了があるか
    let streakPaw = 0;
    const last7 = getLastNDates(STREAK_DAYS);
    const { data: streakDays } = await supabase
      .from("task_completions")
      .select("for_date")
      .eq("user_id", profile.id)
      .in("for_date", last7);

    const uniqueDays = new Set((streakDays ?? []).map((r) => r.for_date));
    if (uniqueDays.size >= STREAK_DAYS) {
      // 今日すでにストリークボーナスを付与済みか確認（重複防止）
      const { count: alreadyBonused } = await supabase
        .from("currency_transactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .eq("reason", "streak_bonus")
        .eq("note", today);

      if (!alreadyBonused) {
        streakPaw = STREAK_PAW_BONUS;
        await adjustCurrency({
          kind: "paw",
          amount: STREAK_PAW_BONUS,
          reason: "streak_bonus",
          note: today,
        });
      }
    }

    revalidatePath("/tasks");
    revalidatePath("/");
    return { perfect, rareFish, rarePaw, streakPaw };
  }
}
