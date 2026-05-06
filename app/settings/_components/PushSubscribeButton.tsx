"use client";

/* PWA / 通知 API はブラウザ依存のため useEffect 内 setState を許容 */
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, useTransition } from "react";
import { saveSubscription, unsubscribeAll, sendTestNotification } from "@/app/_actions/push";

type Props = {
  vapidPublicKey: string;
};

type PermissionState = "default" | "granted" | "denied" | "unsupported";

export function PushSubscribeButton({ vapidPublicKey }: Props) {
  const [isPending, startTransition] = useTransition();
  const [permission, setPermission] = useState<PermissionState>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as PermissionState);

    // 既に購読しているか確認
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    });
  }, []);

  const handleSubscribe = () => {
    startTransition(async () => {
      try {
        console.log("[push] start, VAPID key length:", vapidPublicKey?.length);
        if (!vapidPublicKey || vapidPublicKey.length < 80) {
          throw new Error(
            `VAPID公開鍵が無効です（長さ: ${vapidPublicKey?.length ?? 0}）。devサーバー再起動が必要かもしれません。`
          );
        }

        // 1. 通知許可
        const perm = await Notification.requestPermission();
        setPermission(perm as PermissionState);
        if (perm !== "granted") {
          alert("通知が許可されませんでした");
          return;
        }

        // 2. Service Worker から PushManager を取得
        const reg = await navigator.serviceWorker.ready;
        console.log("[push] SW ready, scope:", reg.scope, "active:", !!reg.active);

        // 3. 既存の購読があれば一度解除（VAPID鍵が変わった可能性に対応）
        const existing = await reg.pushManager.getSubscription();
        if (existing) {
          console.log("[push] existing subscription found, unsubscribing...");
          await existing.unsubscribe();
        }

        // 4. 新しい購読を作成
        console.log("[push] subscribing with new VAPID key...");
        const key = urlBase64ToUint8Array(vapidPublicKey);
        console.log("[push] key bytes:", key.length, "first byte:", key[0]);

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: key,
        });
        console.log("[push] subscription created:", sub.endpoint);

        // 5. サーバーに保存
        const json = sub.toJSON();
        await saveSubscription({
          endpoint: json.endpoint!,
          keys: {
            p256dh: json.keys?.p256dh ?? "",
            auth: json.keys?.auth ?? "",
          },
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        });

        setIsSubscribed(true);
        alert("通知を有効化しました");
      } catch (err) {
        console.error("[push/subscribe] error detail:", err);
        const detail =
          err instanceof Error
            ? `${err.name}: ${err.message}`
            : String(err);
        alert("購読に失敗しました: " + detail);
      }
    });
  };

  const handleUnsubscribe = () => {
    if (!confirm("通知をオフにしますか？")) return;
    startTransition(async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) await sub.unsubscribe();
        await unsubscribeAll();
        setIsSubscribed(false);
        alert("通知をオフにしました");
      } catch (err) {
        alert(err instanceof Error ? err.message : "失敗");
      }
    });
  };

  const handleTest = () => {
    startTransition(async () => {
      try {
        const result = await sendTestNotification();
        alert(`テスト通知を送信しました（成功 ${result.sent} / 失敗 ${result.failed}）`);
      } catch (err) {
        alert(err instanceof Error ? err.message : "失敗");
      }
    });
  };

  if (permission === "unsupported") {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-900">
        ⚠️ このブラウザは Web Push 通知に対応していません
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-900">
        🚫 通知がブロックされています。ブラウザの設定から許可に変更してください。
      </div>
    );
  }

  if (isSubscribed) {
    return (
      <div className="space-y-2">
        <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
          ✅ 通知が有効になっています
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleTest}
            disabled={isPending}
            className="flex-1 px-4 py-2 bg-nyan-blue text-gray-800 rounded-full hover:opacity-80 transition text-sm disabled:opacity-50"
          >
            🧪 テスト通知を送る
          </button>
          <button
            onClick={handleUnsubscribe}
            disabled={isPending}
            className="px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition text-sm disabled:opacity-50"
          >
            通知をオフ
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={isPending}
      className="w-full px-6 py-3 bg-nyan-pink-deep text-white rounded-full hover:opacity-80 transition font-semibold disabled:opacity-50"
    >
      {isPending ? "設定中..." : "🔔 通知をオンにする"}
    </button>
  );
}

/**
 * Base64URL → Uint8Array 変換（VAPID 公開鍵の形式変換）
 * pushManager.subscribe の applicationServerKey が ArrayBuffer ベースの BufferSource を要求するため、
 * 明示的に ArrayBuffer ベースの Uint8Array を返す（TS 5.7+ のジェネリック型対応）。
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    view[i] = rawData.charCodeAt(i);
  }
  return view;
}
