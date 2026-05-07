"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateGeminiApiKey(formData: FormData) {
  await requireAuth();
  const raw = (formData.get("apiKey") as string) ?? "";
  const trimmed = raw.trim();

  // 簡易バリデーション
  if (trimmed && !/^AIza[0-9A-Za-z_-]{30,}$/.test(trimmed)) {
    throw new Error(
      "Gemini APIキーの形式が不正です（'AIza' で始まる文字列を入れてください）"
    );
  }

  const supabase = await createClient();
  const { error } = trimmed
    ? await supabase.rpc("set_user_gemini_key", { p_key: trimmed })
    : await supabase.rpc("delete_user_gemini_key");

  if (error) {
    console.error("[settings/updateApiKey] error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/settings");
  revalidatePath("/");
}

export async function deleteGeminiApiKey() {
  await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase.rpc("delete_user_gemini_key");

  if (error) {
    console.error("[settings/deleteApiKey] error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/settings");
  revalidatePath("/");
}
