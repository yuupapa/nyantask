"use client";

import { useTransition } from "react";
import { petCat } from "@/app/_actions/cat";

type Props = {
  pawBalance: number;
  cost?: number;
};

export function PetCatButton({ pawBalance, cost = 1 }: Props) {
  const [isPending, startTransition] = useTransition();
  const canPet = pawBalance >= cost;

  const handlePet = () => {
    startTransition(async () => {
      try {
        await petCat();
      } catch (err) {
        alert(err instanceof Error ? err.message : "なでなでに失敗しました");
      }
    });
  };

  return (
    <button
      onClick={handlePet}
      disabled={isPending || !canPet}
      className={`w-full px-4 py-3 rounded-full font-semibold text-sm transition ${
        canPet
          ? "bg-nyan-pink-deep text-white hover:opacity-80"
          : "bg-gray-200 text-gray-400 cursor-not-allowed"
      } disabled:opacity-60`}
      title={
        canPet
          ? `🐾 ${cost} を消費して、なかよし度 +30 と機嫌 +20`
          : `にくきゅうが ${cost} 必要です`
      }
    >
      {isPending
        ? "なでなで中..."
        : canPet
          ? `🤚 なでなで（🐾 ${cost} 消費）`
          : `🤚 なでなで（🐾 ${cost} 必要）`}
    </button>
  );
}
