import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getTodayDate } from "@/lib/date";
import type { Task } from "@/lib/types";
import { addRoutineTask, addDailyTask } from "./_actions";
import { TaskList } from "./_components/TaskList";
import { AddTaskForm } from "./_components/AddTaskForm";
import { AuthShell } from "@/app/_components/AuthShell";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const profile = await requireAuth();
  const supabase = await createClient();
  const today = getTodayDate();

  // 自分のタスク（アーカイブされていないもの）を取得
  const { data: allTasks } = await supabase
    .from("tasks")
    .select("id, user_id, title, type, for_date, sort_order, archived_at, created_at")
    .eq("user_id", profile.id)
    .is("archived_at", null)
    .order("type", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const tasks = (allTasks ?? []) as Task[];

  // 今日表示すべきもの：routine 全部 + daily で for_date が today
  const todayTasks = tasks.filter(
    (t) => t.type === "routine" || t.for_date === today
  );

  // 今日の完了履歴を取得
  const { data: completions } = await supabase
    .from("task_completions")
    .select("task_id")
    .eq("user_id", profile.id)
    .eq("for_date", today);

  const completedIds = new Set<string>(
    (completions ?? []).map((c: { task_id: string }) => c.task_id)
  );

  // 達成率
  const totalCount = todayTasks.length;
  const completedCount = todayTasks.filter((t) => completedIds.has(t.id)).length;
  const rate = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const remaining = totalCount - completedCount;

  // routine と daily に分割
  const routineTasks = todayTasks.filter((t) => t.type === "routine");
  const dailyTasks = todayTasks.filter((t) => t.type === "daily");

  return (
    <AuthShell>
    <main className="min-h-screen bg-nyan-cream">
      <header className="bg-white/80 backdrop-blur border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-nyan-pink-deep">📝 やることリスト</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* 達成率カード */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-gray-600">今日の達成状況</div>
              <div className="text-xs text-gray-500 mt-0.5">{today}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-nyan-pink-deep">
                {completedCount} / {totalCount}
              </div>
              <div className="text-sm text-gray-500">達成率 {rate}%</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-nyan-pink-deep h-3 rounded-full transition-all duration-500"
              style={{ width: `${rate}%` }}
            />
          </div>
          {totalCount > 0 && remaining > 0 && (
            <p className="text-sm text-gray-600 mt-3">
              残り <span className="font-bold">{remaining}</span> 個！がんばろう 🐱
            </p>
          )}
          {totalCount > 0 && remaining === 0 && (
            <p className="text-sm text-green-700 mt-3 font-semibold">
              🎉 今日のタスクは全部達成しました！
            </p>
          )}
          {totalCount === 0 && (
            <p className="text-sm text-gray-500 mt-3">
              まだタスクがありません。下から追加してください。
            </p>
          )}
        </div>

        {/* ルーチンタスク */}
        <section className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
          <div>
            <h2 className="font-bold flex items-center gap-2">
              🔁 ルーチンタスク
            </h2>
            <p className="text-xs text-gray-500 mt-1">毎日繰り返し表示されるタスク</p>
          </div>
          <TaskList
            tasks={routineTasks}
            completedIds={completedIds}
            emptyMessage="毎日やることをまずは1つ追加しましょう"
          />
          <AddTaskForm
            action={addRoutineTask}
            placeholder="例：動画ネタを考える"
          />
        </section>

        {/* デイリータスク */}
        <section className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
          <div>
            <h2 className="font-bold flex items-center gap-2">
              📅 今日だけのタスク
            </h2>
            <p className="text-xs text-gray-500 mt-1">今日（{today}）だけ表示されます</p>
          </div>
          <TaskList
            tasks={dailyTasks}
            completedIds={completedIds}
            emptyMessage="今日だけの予定があれば追加してください"
          />
          <AddTaskForm
            action={addDailyTask}
            placeholder="例：銀行に振込、A社に連絡"
          />
        </section>
      </div>
    </main>
    </AuthShell>
  );
}
