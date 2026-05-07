"use client";

import { useState } from "react";
import { broadcastNotification } from "@/app/_actions/push";

type Result = {
  sent: number;
  failed: number;
  recipients: number;
} | null;

export function BroadcastNotificationForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState<Result>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleBroadcast = async () => {
    if (!title.trim()) {
      alert("タイトルを入力してください");
      return;
    }
    if (!body.trim()) {
      alert("本文を入力してください");
      return;
    }

    setIsSending(true);
    setError(null);
    setResult(null);
    try {
      const res = await broadcastNotification({
        title: title.trim(),
        body: body.trim(),
      });
      setResult(res);
      setTitle("");
      setBody("");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "通知送信に失敗しました";
      setError(msg);
      console.error("[broadcast] error:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          タイトル
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSending}
          placeholder="例：タスクボーナス達成！"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nyan-pink-deep disabled:opacity-50"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          本文
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={isSending}
          placeholder="例：7日連続達成でプレミアム報酬をゲット！"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nyan-pink-deep disabled:opacity-50"
        />
      </div>

      <button
        type="button"
        onClick={handleBroadcast}
        disabled={isSending}
        className="w-full px-6 py-3 bg-nyan-pink-deep text-white rounded-lg hover:opacity-80 transition font-semibold disabled:opacity-50"
      >
        {isSending ? "送信中..." : "📢 全ユーザーに送信"}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-900">
          <p className="font-semibold">❌ エラー</p>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-900">
          <p className="font-semibold">✅ 送信完了</p>
          <div className="mt-2 space-y-1">
            <p>対象ユーザー：{result.recipients}名</p>
            <p>成功：{result.sent}件</p>
            {result.failed > 0 && (
              <p className="text-orange-700">失敗：{result.failed}件</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
