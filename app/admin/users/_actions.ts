"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireAdmin, isValidRole } from "@/lib/auth";

export async function updateUserRole(userId: string, newRole: string) {
  const admin = await requireAdmin();

  // 自分自身のロール変更を禁止（admin外しの事故防止）
  if (admin.id === userId) {
    throw new Error("自分自身のロールは変更できません");
  }

  // 有効なロールか
  if (!isValidRole(newRole)) {
    throw new Error(`無効なロール: ${newRole}`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) {
    console.error("[admin/users/updateRole] error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin");
}
