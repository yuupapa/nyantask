import type { MetadataRoute } from "next";

/**
 * PWA Web App Manifest
 * Next.js が `/manifest.webmanifest` として配信する。
 *
 * Phase 1.6.1：基本のホーム画面追加対応のみ。
 * Service Worker（オフライン・Web Push）は Phase 1.6.3 で。
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "にゃんタスク",
    short_name: "にゃんタスク",
    description: "ToDoしながら、ねこ集め！YouTubeコンサル生向け猫育成ToDoアプリ",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFF6E5",
    theme_color: "#FF7B9C",
    lang: "ja",
    categories: ["productivity", "lifestyle"],
    // Chrome Web Push (FCM) に必要な固定値
    gcm_sender_id: "103953800507",
  } as MetadataRoute.Manifest & { gcm_sender_id: string };
}
