import { requireAuth } from "@/lib/auth";
import { ApiKeyForm } from "./_components/ApiKeyForm";
import { PushSubscribeButton } from "./_components/PushSubscribeButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const profile = await requireAuth();
  const hasKey = profile.has_gemini_key;
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

  return (
    <main className="min-h-screen bg-nyan-cream">
      <header className="bg-white/70 backdrop-blur border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-nyan-pink-deep">⚙️ 設定</h1>
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-nyan-pink-deep transition"
          >
            ← ホームへ
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-bold">🔔 通知</h2>
          <p className="text-sm text-gray-600">
            通知をオンにすると、猫からのお知らせがプッシュ通知で届きます（Phase 2 で本格運用）
          </p>
          {vapidPublicKey ? (
            <PushSubscribeButton vapidPublicKey={vapidPublicKey} />
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-900">
              ⚠️ VAPID 公開鍵が設定されていません（管理者が設定する必要があります）
            </div>
          )}
        </section>

        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-bold">🤖 Gemini API キー</h2>
          <ApiKeyForm hasKey={hasKey} />
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-3">アカウント情報</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">名前</dt>
              <dd className="font-semibold">
                {profile.display_name ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">メール</dt>
              <dd className="font-mono text-xs">{profile.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">ロール</dt>
              <dd>{profile.role === "admin" ? "管理者" : "一般"}</dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  );
}
