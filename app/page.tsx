import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getTodayDate } from "@/lib/date";
import { getOrCreateActiveCat } from "@/app/_actions/cat";
import { CurrencyDisplay } from "@/app/_components/CurrencyDisplay";
import { AuthShell } from "@/app/_components/AuthShell";
import { HomeCatHero } from "@/app/_components/HomeCatHero";
import { getDaysSinceBorn } from "@/lib/cat";
import type { Task } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const profile = await requireAuth();
  const supabase = await createClient();
  const today = getTodayDate();

  // 猫取得
  let cat = null;
  try {
    cat = await getOrCreateActiveCat();
  } catch {
    // 猫取得失敗は無視してページ表示を続ける
  }

  // タスク取得
  const { data: allTasks } = await supabase
    .from("tasks")
    .select("id, title, type, for_date, sort_order")
    .eq("user_id", profile.id)
    .is("archived_at", null)
    .or(`type.eq.routine,for_date.eq.${today}`)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(10);

  const tasks = (allTasks ?? []) as Task[];

  // 完了タスクID取得
  const { data: completions } = await supabase
    .from("task_completions")
    .select("task_id")
    .eq("user_id", profile.id)
    .eq("for_date", today);

  const completedIds = new Set((completions ?? []).map((c) => c.task_id));
  const completed = completedIds.size;
  const total = tasks.length;
  const remaining = Math.max(0, total - completed);

  return (
    <AuthShell>
      <main className="min-h-screen bg-nyan-cream">
        {/* ─── ヘッダー ─── */}
        <header className="bg-nyan-cream sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-extrabold tracking-tight">
              <span style={{ color: "#FF8FA8" }}>にゃん</span>
              <span style={{ color: "#5DAEE8" }}>タスク</span>
            </h1>
            <CurrencyDisplay coin={profile.coin} paw={profile.paw} />
          </div>
        </header>

        <div className="max-w-md mx-auto">
          {/* ─── 猫ヒーローエリア ─── */}
          <HomeCatHero remaining={remaining} completed={completed} total={total} />

          <div className="px-4 pb-6 space-y-5">
            {/* ─── やることリスト ─── */}
            <section>
              {/* 見出し画像 */}
              <div className="mb-3">
                <Image
                  src="/home-assets/todo_heading.png"
                  alt="やることリスト"
                  width={856}
                  height={99}
                  style={{ width: "100%", height: "auto" }}
                />
              </div>

              {tasks.length === 0 ? (
                <Link
                  href="/tasks"
                  className="block bg-white rounded-2xl p-4 text-center shadow-sm border border-dashed border-gray-200 hover:border-nyan-pink transition"
                >
                  <p className="text-sm text-gray-400">タスクがまだありません</p>
                  <p className="text-sm text-nyan-pink-deep font-semibold mt-1">
                    ＋ タスクを追加する
                  </p>
                </Link>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => {
                    const done = completedIds.has(task.id);
                    return (
                      <Link
                        key={task.id}
                        href="/tasks"
                        className={`flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border transition hover:shadow-md ${
                          done ? "border-green-100 opacity-60" : "border-gray-100"
                        }`}
                      >
                        {/* チェックボックス風アイコン */}
                        <span
                          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                            done
                              ? "bg-green-400 border-green-400 text-white"
                              : "border-gray-300"
                          }`}
                        >
                          {done ? "✓" : ""}
                        </span>
                        <span
                          className={`flex-1 text-sm font-medium ${
                            done ? "line-through text-gray-400" : "text-gray-700"
                          }`}
                        >
                          {task.title}
                        </span>
                        <span className="text-gray-300 text-xs">›</span>
                      </Link>
                    );
                  })}
                  {total > 10 && (
                    <Link
                      href="/tasks"
                      className="block text-center text-xs text-nyan-pink-deep py-2 font-semibold hover:underline"
                    >
                      すべて見る →
                    </Link>
                  )}
                </div>
              )}
            </section>

            {/* ─── 育成 & 図鑑カード ─── */}
            <section className="grid grid-cols-2 gap-3">
              {/* 育成カード */}
              <Link
                href="/cat"
                className="bg-white rounded-2xl p-4 shadow-sm border border-yellow-100 hover:shadow-md transition flex flex-col items-center gap-2"
              >
                <div className="flex items-center gap-1 text-xs font-bold text-yellow-600 self-start">
                  <span>🐾</span><span>育成</span>
                </div>
                {cat ? (
                  <>
                    <Image
                      src={`/cats/cat-${String(cat.visual_id ?? 1).padStart(3, "0")}.png`}
                      alt={cat.name ?? "ねこ"}
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                    <p className="text-xs text-gray-500">
                      なでなでしてねこを育てよう！
                    </p>
                    <p className="text-xs font-bold text-yellow-600">
                      あと{Math.max(0, 15 - getDaysSinceBorn(cat.born_at))}日で成長
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-gray-400 text-center">ねこを育てよう！</p>
                )}
              </Link>

              {/* 図鑑カード */}
              <Link
                href="/cats"
                className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100 hover:shadow-md transition flex flex-col items-center gap-2"
              >
                <div className="flex items-center gap-1 text-xs font-bold text-blue-500 self-start">
                  <span>📖</span><span>図鑑</span>
                </div>
                <p className="text-xs text-gray-500 text-center mt-1">
                  ねこたちをコレクションしよう！
                </p>
                <span className="mt-auto text-xs font-bold text-blue-500 border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-50 transition">
                  図鑑を見る ›
                </span>
              </Link>
            </section>

            {/* ─── 管理画面（admin のみ） ─── */}
            {profile.role === "admin" && (
              <Link
                href="/admin"
                className="block bg-nyan-blue/30 rounded-2xl p-3 text-center text-sm font-semibold text-gray-700 hover:bg-nyan-blue/50 transition"
              >
                🛠️ 管理画面
              </Link>
            )}
          </div>
        </div>
      </main>
    </AuthShell>
  );
}
