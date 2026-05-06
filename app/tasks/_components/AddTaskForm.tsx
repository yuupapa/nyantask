"use client";

import { useTransition, useRef } from "react";

type Props = {
  action: (formData: FormData) => Promise<void>;
  placeholder?: string;
  buttonLabel?: string;
};

export function AddTaskForm({
  action,
  placeholder = "新しいタスク",
  buttonLabel = "＋追加",
}: Props) {
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        await action(formData);
        if (inputRef.current) inputRef.current.value = "";
      } catch (err) {
        alert(
          "追加に失敗しました: " +
            (err instanceof Error ? err.message : "不明なエラー")
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 pt-1">
      <input
        ref={inputRef}
        type="text"
        name="title"
        required
        maxLength={200}
        placeholder={placeholder}
        disabled={isPending}
        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-nyan-pink-deep disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 bg-nyan-pink-deep text-white rounded hover:opacity-80 transition disabled:opacity-50 whitespace-nowrap"
      >
        {buttonLabel}
      </button>
    </form>
  );
}
