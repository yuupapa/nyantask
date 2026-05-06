"use client";

/* Service Worker 登録は副作用がブラウザAPIに依存するため、
   useEffect 内での setState を許容（このファイルでは現状 setState 不使用）。 */

import { useEffect } from "react";

/**
 * /sw.js を登録するクライアントコンポーネント。
 * layout で1回だけ呼び出すこと。
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // ページロード後に登録（早すぎるとパフォーマンスに影響）
    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((err) => {
          console.error("[sw] registration failed:", err);
        });
    };

    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);

  return null;
}
