"use server";

import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// VAPID 設定（Server Action 起動時に1回だけ初期化）
function configureWebPush() {
  if (
    !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    !process.env.VAPID_PRIVATE_KEY ||
    !process.env.VAPID_SUBJECT
  ) {
    throw new Error(
      "VAPID 環境変数が設定されていません（NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT）"
    );
  }
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

type SerializedSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userAgent?: string;
};

/**
 * クライアントから取得した PushSubscription を保存。
 * 既存（同じ endpoint）があれば上書きする（UNIQUE 制約に従う）。
 */
export async function saveSubscription(sub: SerializedSubscription) {
  const profile = await requireAuth();
  const supabase = await createClient();

  // 既存の同じ endpoint を削除して再作成（実質 upsert）
  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", profile.id)
    .eq("endpoint", sub.endpoint);

  const { error } = await supabase.from("push_subscriptions").insert({
    user_id: profile.id,
    endpoint: sub.endpoint,
    p256dh: sub.keys.p256dh,
    auth_secret: sub.keys.auth,
    user_agent: sub.userAgent ?? null,
  });

  if (error) {
    console.error("[push/save] error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/settings");
}

/**
 * 購読解除（このユーザーの購読をすべて削除）。
 */
export async function unsubscribeAll() {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", profile.id);

  if (error) {
    console.error("[push/unsubscribe] error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/settings");
}

/**
 * 自分宛にテスト通知を送る。
 */
export async function sendTestNotification(): Promise<{ sent: number; failed: number }> {
  const profile = await requireAuth();
  configureWebPush();

  const supabase = await createClient();
  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth_secret")
    .eq("user_id", profile.id);

  if (error) {
    console.error("[push/test] fetch error:", error);
    throw new Error(error.message);
  }
  if (!subs || subs.length === 0) {
    throw new Error("通知の購読がありません。設定画面で「通知をオン」にしてください。");
  }

  const payload = JSON.stringify({
    title: "🐱 にゃんタスク",
    body: "テスト通知だにゃ！届いてるかな？",
    url: "/",
    tag: "test",
  });

  let sent = 0;
  let failed = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth_secret },
          },
          payload
        );
        sent++;
      } catch (err) {
        failed++;
        console.error("[push/test] send error:", err);
        // 410 Gone（無効な購読）は削除する
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", s.id);
        }
      }
    })
  );

  return { sent, failed };
}

/**
 * 管理者用：全ユーザーへブロードキャスト送信。
 */
export async function broadcastNotification(input: {
  title: string;
  body: string;
  url?: string;
}): Promise<{ sent: number; failed: number; recipients: number }> {
  await requireAdmin();
  configureWebPush();

  const supabase = await createClient();
  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth_secret");

  if (error) {
    console.error("[push/broadcast] fetch error:", error);
    throw new Error(error.message);
  }
  if (!subs || subs.length === 0) {
    return { sent: 0, failed: 0, recipients: 0 };
  }

  const payload = JSON.stringify({
    title: input.title,
    body: input.body,
    url: input.url ?? "/",
    tag: "broadcast",
  });

  let sent = 0;
  let failed = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth_secret },
          },
          payload
        );
        sent++;
      } catch (err) {
        failed++;
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", s.id);
        }
      }
    })
  );

  return { sent, failed, recipients: subs.length };
}
