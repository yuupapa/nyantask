"use client";

import { useState, useTransition, useRef } from "react";
import { updateCatName } from "@/app/_actions/cat";

type Props = {
  catId: string;
  initialName: string;
};

export function CatNameEditor({ catId, initialName }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialName);
  const [displayName, setDisplayName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEdit = () => {
    setValue(displayName);
    setError(null);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed) { setError("名前を入力してください"); return; }
    if (trimmed.length > 20) { setError("20文字以内にしてください"); return; }

    startTransition(async () => {
      try {
        await updateCatName(catId, trimmed);
        setDisplayName(trimmed);
        setEditing(false);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "更新に失敗しました");
      }
    });
  };

  const handleCancel = () => {
    setEditing(false);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  if (editing) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={20}
            disabled={isPending}
            className="text-xl font-bold border-b-2 border-nyan-pink-deep bg-transparent outline-none w-36 py-0.5"
            autoFocus
          />
          <button
            onClick={handleSave}
            disabled={isPending}
            className="text-xs px-2 py-0.5 bg-nyan-pink-deep text-white rounded-full disabled:opacity-50"
          >
            {isPending ? "…" : "保存"}
          </button>
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full disabled:opacity-50"
          >
            キャンセル
          </button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xl font-bold">{displayName}</span>
      <button
        onClick={handleEdit}
        className="text-gray-400 hover:text-nyan-pink-deep transition text-sm"
        aria-label="名前を変更"
      >
        ✏️
      </button>
    </div>
  );
}
