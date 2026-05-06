// にゃんタスク Service Worker
// PWAインストール要件 + Web Push 通知のハンドリング。
// オフラインキャッシュは Phase 2 で（必要なら）。

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // パススルー（インストール要件のためのハンドラー）
});

// ============================================================
// Web Push 受信
// ============================================================
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (err) {
    console.error("[sw] push payload parse error:", err);
  }

  const title = payload.title || "にゃんタスク";
  const options = {
    body: payload.body || "猫からのお知らせにゃ",
    icon: payload.icon || "/icon",
    badge: payload.badge || "/icon",
    tag: payload.tag || "nyantask-default",
    data: { url: payload.url || "/" },
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 通知クリックでアプリを開く
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // 既に開いているタブがあればそこへフォーカス
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // なければ新しく開く
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
