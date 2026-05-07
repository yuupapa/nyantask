"use client";

import { useTransition, useState, useEffect } from "react";
import { toggleTaskCompletion, deleteTask } from "../_actions";
import type { ToggleResult } from "../_actions";

type TaskItemData = {
  id: string;
  title: string;
};

type Props = {
  tasks: TaskItemData[];
  completedIds: Set<string>;
  emptyMessage?: string;
};

export function TaskList({
  tasks,
  completedIds,
  emptyMessage = "まだタスクがありません",
}: Props) {
  if (tasks.length === 0) {
    return <p className="text-sm text-gray-500 py-2">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          isCompleted={completedIds.has(task.id)}
        />
      ))}
    </ul>
  );
}

function TaskItem({
  task,
  isCompleted,
}: {
  task: TaskItemData;
  isCompleted: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [reward, setReward] = useState<ToggleResult | null>(null);

  // 報酬表示を 2.5 秒後に消す
  useEffect(() => {
    if (!reward) return;
    const t = setTimeout(() => setReward(null), 2500);
    return () => clearTimeout(t);
  }, [reward]);

  const handleToggle = () => {
    startTransition(async () => {
      try {
        const result = await toggleTaskCompletion(task.id, isCompleted);
        // 完了時のみ報酬通知（uncomplete はスキップ）
        if (!isCompleted && (result.perfect || result.rareCoin > 0 || result.streakPaw > 0)) {
          setReward(result);
        }
      } catch (err) {
        alert(
          "更新に失敗しました: " +
            (err instanceof Error ? err.message : "不明なエラー")
        );
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`「${task.title}」を削除しますか？`)) return;
    startTransition(async () => {
      try {
        await deleteTask(task.id);
      } catch (err) {
        alert(
          "削除に失敗しました: " +
            (err instanceof Error ? err.message : "不明なエラー")
        );
      }
    });
  };

  return (
    <li
      className={`relative flex items-center gap-3 p-3 rounded-lg border transition ${
        isCompleted
          ? "bg-green-50 border-green-200"
          : "bg-white border-gray-200 hover:border-nyan-pink-deep"
      } ${isPending ? "opacity-60" : ""}`}
    >
      <input
        type="checkbox"
        checked={isCompleted}
        onChange={handleToggle}
        disabled={isPending}
        className="w-5 h-5 cursor-pointer accent-nyan-pink-deep"
      />
      <span
        className={`flex-1 ${
          isCompleted ? "line-through text-gray-500" : "text-gray-800"
        }`}
      >
        {task.title}
      </span>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-red-500 hover:text-red-700 text-xs disabled:opacity-50"
        aria-label="タスクを削除"
      >
        削除
      </button>

      {/* 報酬ポップアップ */}
      {reward && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-2 bg-white border border-yellow-300 shadow-md rounded-full px-3 py-1 text-xs font-semibold text-gray-800 animate-bounce z-10 whitespace-nowrap">
          {reward.perfect && <span>🎉 パーフェクト +{5}🪙</span>}
          {reward.rareCoin > 0 && <span>✨ レア +{reward.rareCoin}🪙</span>}
          {reward.rarePaw > 0 && <span>+{reward.rarePaw}🐾</span>}
          {reward.streakPaw > 0 && <span>🔥 7日連続 +{reward.streakPaw}🐾</span>}
        </div>
      )}
    </li>
  );
}
