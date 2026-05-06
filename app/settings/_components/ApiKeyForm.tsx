"use client";

import { useTransition, useState } from "react";
import { updateGeminiApiKey, deleteGeminiApiKey } from "../_actions";

type Props = {
  hasKey: boolean;
};

export function ApiKeyForm({ hasKey }: Props) {
  const [isPending, startTransition] = useTransition();
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        await updateGeminiApiKey(formData);
        form.reset();
        alert("APIキーを保存しました");
      } catch (err) {
        alert(
          err instanceof Error ? err.message : "保存に失敗しました"
        );
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("APIキーを削除しますか？削除すると猫が話せなくなります")) return;
    startTransition(async () => {
      try {
        await deleteGeminiApiKey();
        alert("APIキーを削除しました");
      } catch (err) {
        alert(err instanceof Error ? err.message : "削除に失敗しました");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm">
        <p className="font-semibold mb-2">💡 Gemini APIキーとは？</p>
        <p className="text-gray-700">
          APIキーを設定すると、猫があなたに話しかけてくれるようになります。
          Google AI Studio で無料で取得できます。
        </p>
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-blue-600 hover:underline"
        >
          → Google AI Studio で APIキーを取得する
        </a>
      </div>

      {hasKey && (
        <div className="bg-green-50 border border-green-200 rounded p-3 text-sm flex items-center justify-between">
          <span className="text-green-800">
            ✅ APIキーは保存されています
          </span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="text-red-600 text-xs hover:underline disabled:opacity-50"
          >
            削除する
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-semibold mb-1">
            {hasKey ? "新しいAPIキーで上書き" : "APIキーを入力"}
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              name="apiKey"
              required
              placeholder="AIzaSy..."
              disabled={isPending}
              className="w-full px-3 py-2 pr-20 border border-gray-300 rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-nyan-pink-deep disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-800 px-2 py-1"
            >
              {showKey ? "隠す" : "表示"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            APIキーは「AIzaSy」で始まる長い文字列です
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full px-6 py-2 bg-nyan-pink-deep text-white rounded-full hover:opacity-80 transition disabled:opacity-50"
        >
          {isPending ? "保存中..." : "💾 保存"}
        </button>
      </form>

      <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-600">
        <p className="font-semibold mb-1">🔒 セキュリティについて</p>
        <ul className="list-disc list-inside space-y-1">
          <li>APIキーはサーバーに暗号化保存され、あなた以外には見えません</li>
          <li>APIキーはサーバー側でのみ使われ、ブラウザには送信されません</li>
          <li>不要になったらいつでも削除できます</li>
        </ul>
      </div>
    </div>
  );
}
