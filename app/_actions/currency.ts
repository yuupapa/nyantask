"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import type { CurrencyKind, CurrencyReason } from "@/lib/types";

/**
 * 通貨を増減する。
 *  - profiles.coin / paw を更新
 *  - currency_transactions に履歴を残す
 *  - 残高が負になる操作は CHECK 制約で弾かれる（その場合エラーをログ出力するが投げない）
 *
 * @param amount 正：増加、負：減少
 */
export async function adjustCurrency(input: {
  kind: CurrencyKind;
  amount: number;
  reason: CurrencyReason;
  relatedId?: string | null;
  note?: string | null;
}): Promise<void> {
  if (input.amount === 0) return;

  const profile = await requireAuth();
  const supabase = await createClient();

  // 現残高を取得
  const { data: current, error: fetchError } = await supabase
    .from("profiles")
    .select("coin, paw")
    .eq("id", profile.id)
    .single();

  if (fetchError || !current) {
    console.error("[currency/adjust] fetch error:", fetchError);
    return;
  }

  const column = input.kind;
  const newBalance = (current[column] as number) + input.amount;

  // 残高が負になる場合は減少量を制限
  if (newBalance < 0) {
    console.warn(
      `[currency/adjust] insufficient ${column}: ${current[column]} + ${input.amount} < 0、減少をスキップ`
    );
    return;
  }

  // profiles を更新
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ [column]: newBalance })
    .eq("id", profile.id);

  if (updateError) {
    console.error("[currency/adjust] update error:", updateError);
    return;
  }

  // 履歴記録（失敗してもメインフローは継続）
  const { error: txError } = await supabase.from("currency_transactions").insert({
    user_id: profile.id,
    kind: input.kind,
    amount: input.amount,
    reason: input.reason,
    related_id: input.relatedId ?? null,
    note: input.note ?? null,
  });

  if (txError) {
    console.error("[currency/adjust] tx insert error:", txError);
  }
}
