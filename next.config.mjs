import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    // Workspace root を明示（C:\ClaudeCode\package-lock.json を誤検出するのを防ぐ）
    root: __dirname,
  },
  // Phase 1 で next-pwa を追加予定
};

export default nextConfig;
