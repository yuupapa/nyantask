import { requireAdmin } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // adminガード（admin以外は404）
  await requireAdmin();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-nyan-pink-deep">
            🐱 にゃんタスク 管理画面
          </h1>
          <nav className="flex gap-4 text-sm">
            <Link
              href="/admin"
              className="text-gray-700 hover:text-nyan-pink-deep transition"
            >
              ダッシュボード
            </Link>
            <Link
              href="/admin/users"
              className="text-gray-700 hover:text-nyan-pink-deep transition"
            >
              ユーザー
            </Link>
            <Link
              href="/"
              className="text-gray-500 hover:text-nyan-pink-deep transition"
            >
              ← アプリへ戻る
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">{children}</main>
    </div>
  );
}
