import "server-only";

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import type { Profile } from "@/lib/types";

// 型・定数の re-export（後方互換）
export {
  USER_ROLES,
  ROLE_LABELS,
  isValidRole,
  type UserRole,
  type Profile,
} from "@/lib/types";

/**
 * 現在ログイン中のユーザーの profile を取得。
 * 未ログインなら null を返す。
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "id, email, display_name, role, fish, paw, gemini_api_key, created_at, last_seen_at"
    )
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("[lib/auth] profile fetch error:", error);
    return null;
  }

  return profile as Profile;
}

/**
 * 管理画面用：admin 限定ガード。
 *  - 未ログイン → /login へリダイレクト
 *  - admin 以外 → notFound()（404、管理画面の存在を秘匿）
 */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "admin") {
    notFound();
  }

  return profile;
}

/**
 * 通常ページ用：ログイン必須ガード。
 *  - 未ログイン → /login
 */
export async function requireAuth(): Promise<Profile> {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return profile;
}
