import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getTodayDate } from "@/lib/date";
import { getOrCreateActiveCat } from "@/app/_actions/cat";
import { CatCard } from "@/app/_components/CatCard";
import { CurrencyDisplay } from "@/app/_components/CurrencyDisplay";
import { SummonNewCatButton } from "@/app/_components/SummonNewCatButton";
import { InstallAppButton } from "@/app/_components/InstallAppButton";
import { AuthShell } from "@/app/_components/AuthShell";
import { getDaysSinceBorn } from "@/lib/cat";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const profile = await requireAuth();
  const supabase = await createClient();
  const today = getTodayDate();

  let cat = null;
  let catError: string | null = null;
  try {
    cat = await getOrCreateActiveCat();
  } catch (err) {
    catError = err instanceof Error ? err.message : "unknown";
    console.error("[home] cat fetch error:", err);
  }

  const { count: totalTasks } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profile.id)
    .is("archived_at", null)
    .or(`type.eq.routine,for_date.eq.${today}`);

  const { count: completedTasks } = await supabase
    .from("task_completions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profile.id)
    .eq("for_date", today);

  const total = totalTasks ?? 0;
  const completed = completedTasks ?? 0;
  const remaining = Math.max(0, total - completed);

  return (
    <AuthShell>
      <main className="min-h-screen bg-nyan-cream">
        {/* ヘッダー */}
        <header className="bg-white/80 backdrop-blur border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-extrabold tracking-tight">
              <span style={{ color: "#FF8FA8" }}>にゃん</span>
              <span style={{ color: "#5DAEE8" }}>タスク</span>
            </h1>
            <CurrencyDisplay coin={profile.coin} paw={profile.paw} />
          </div>
        </header>

        <div className="max-w-md mx-auto px-4 py-4 space-y-4">
          {/* タスク残数 — 吹き出しスタイル */}
          <div className="flex justify-center">
            {total === 0 ? (
              <div className="bg-white rounded-2xl px-6 py-3 shadow-sm border border-gray-100 text-center">
                <p className="text-sm text-gray-500">
                  まだタスクがありません
                </p>
                <Link
                  href="/tasks"
                  className="text-sm text-nyan-pink-deep font-semibold hover:underline"
                >
                  タスクを追加する →
                </Link>
              </div>
            ) : remaining === 0 ? (
              <div className="relative bg-green-50 rounded-2xl px-6 py-3 shadow-sm border border-green-200 text-center">
                <p className="text-lg font-bold text-green-700">
                  🎉 今日のタスク完了！
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {completed}個すべて達成しました
                </p>
              </div>
            ) : (
              <Link
                href="/tasks"
                className="relative bg-gradient-to-r from-orange-400 to-nyan-pink-deep rounded-2xl px-8 py-3 shadow-md text-center hover:opacity-90 transition group"
              >
                <p className="text-white font-bold">
                  今日はあと
                  <span className="text-2xl mx-1">{remaining}</span>
                  つ！
                </p>
                <p className="text-white/80 text-xs mt-0.5">
                  {completed}/{total} 達成済み — タップしてチェック ✓
                </p>
                {/* 吹き出し三角 */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-nyan-pink-deep rotate-45 rounded-sm" />
              </Link>
            )}
          </div>

          {/* 猫カード */}
          {catError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-yellow-800">
              <p className="font-semibold">猫の取得に失敗しました</p>
              <p className="text-xs mt-1">{catError}</p>
            </div>
          )}

          {cat && (
            <section>
              <h2 className="text-sm font-bold text-gray-600 mb-2 flex items-center gap-1">
                🌟 育成中
              </h2>
              <CatCard
                cat={cat}
                pawBalance={profile.paw}
                hasApiKey={profile.has_gemini_key}
              />
            </section>
          )}

          {cat && (
            <SummonNewCatButton
              daysAlive={getDaysSinceBorn(cat.born_at)}
              catName={cat.name}
            />
          )}

          {/* クイックリンク — 2カラム */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/shop"
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center hover:shadow-md transition"
            >
              <span className="text-2xl">🛒</span>
              <p className="text-sm font-semibold text-gray-700 mt-1">ショップ</p>
              <p className="text-[10px] text-gray-400 mt-0.5">アイテムを買おう</p>
            </Link>
            <Link
              href="/cats"
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center hover:shadow-md transition"
            >
              <span className="text-2xl">📖</span>
              <p className="text-sm font-semibold text-gray-700 mt-1">ねこ図鑑</p>
              <p className="text-[10px] text-gray-400 mt-0.5">図鑑を見る</p>
            </Link>
          </div>

          {profile.role === "admin" && (
            <Link
              href="/admin"
              className="block bg-nyan-blue/30 rounded-2xl p-3 text-center text-sm font-semibold text-gray-700 hover:bg-nyan-blue/50 transition"
            >
              🛠️ 管理画面
            </Link>
          )}

          <InstallAppButton />
        </div>
      </main>
    </AuthShell>
  );
}
