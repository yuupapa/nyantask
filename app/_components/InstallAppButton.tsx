"use client";

/* PWA判定はブラウザAPI依存のため useEffect 内 setState を許容 */
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";

// PWA インストールプロンプト（Chrome / Edge で発火）
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Browser = "chromium" | "ios-safari" | "other";

/**
 * PWAインストールボタン。
 *  - 常にボタンを表示（インストール済み・PWA起動中を除く）
 *  - クリック時：
 *    - beforeinstallprompt が発火していればネイティブダイアログ
 *    - 未発火なら、ブラウザに応じた手動手順を案内表示
 */
export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [browser, setBrowser] = useState<Browser>("other");
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    // PWAとして起動中か
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsStandalone(true);
    }

    // ブラウザ判定
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua) && !/CriOS|FxiOS/.test(ua);
    const isChromium = /Chrome|Chromium|Edg/.test(ua) && !isIOS;
    if (isIOS) setBrowser("ios-safari");
    else if (isChromium) setBrowser("chromium");
    else setBrowser("other");

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowHint(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  // 既にインストール済み or PWAとして起動中
  if (isStandalone || isInstalled) return null;

  const handleClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
        }
      } catch (err) {
        console.error("[install] error:", err);
      } finally {
        setDeferredPrompt(null);
      }
    } else {
      setShowHint(true);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleClick}
        className="w-full px-6 py-3 bg-nyan-blue text-gray-800 rounded-full hover:opacity-80 transition font-semibold shadow"
      >
        📱 アプリをインストール
      </button>

      {showHint && !deferredPrompt && (
        <div className="mt-3 bg-white/90 border border-gray-200 rounded-lg p-4 text-xs text-gray-700">
          {browser === "ios-safari" && (
            <>
              <p className="font-semibold mb-1">📲 iOS Safariの場合</p>
              <p>
                画面下の<strong>共有ボタン</strong>（□↑）をタップ →
                「<strong>ホーム画面に追加</strong>」を選択してください。
              </p>
            </>
          )}
          {browser === "chromium" && (
            <>
              <p className="font-semibold mb-1">💻 PC Chrome / Edgeの場合</p>
              <p>
                URLバー右端の <strong>⊕</strong> インストールアイコンをクリック、
                <br />
                または右上のメニュー（︙）→
                「<strong>にゃんタスクをインストール</strong>」を選択。
              </p>
              <p className="mt-2 text-gray-500">
                ※ アイコン/メニューが出ない場合は、強制リロード（Ctrl+Shift+R）でページ更新してください。
              </p>
            </>
          )}
          {browser === "other" && (
            <>
              <p className="font-semibold mb-1">📱 ご利用のブラウザ</p>
              <p>
                Chrome / Edge / Safari でアクセスすると、ホーム画面への追加機能が使えます。
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
