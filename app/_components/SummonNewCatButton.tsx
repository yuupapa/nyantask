"use client";

import { useTransition } from "react";
import { summonNewCat } from "@/app/_actions/cat";

const SUMMON_DAYS_REQUIRED = 15;

type Props = {
  daysAlive: number;
  catName: string;
};

export function SummonNewCatButton({ daysAlive, catName }: Props) {
  const [isPending, startTransition] = useTransition();
  const canSummon = daysAlive >= SUMMON_DAYS_REQUIRED;

  const handleSummon = () => {
    if (!canSummon) return;
    if (
      !confirm(
        `新しい猫を迎えますか？\n\n` +
          `現在の「${catName}」は『殿堂入り』として図鑑に永続記録されます。\n` +
          `（記録は残りますが、今後の育成はできなくなります）`
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await summonNewCat();
      } catch (err) {
        alert(err instanceof Error ? err.message : "失敗しました");
      }
    });
  };

  if (!canSummon) {
    const remain = SUMMON_DAYS_REQUIRED - daysAlive;
    return (
      <div className="text-[11px] text-gray-500 text-center py-2">
        新しい猫を迎えるには、現在の猫が若猫になるまで（あと {remain} 日）
      </div>
    );
  }

  return (
    <button
      onClick={handleSummon}
      disabled={isPending}
      className="w-full px-4 py-2 bg-white border-2 border-nyan-pink text-nyan-pink-deep rounded-full hover:bg-nyan-pink/10 transition font-semibold text-sm disabled:opacity-50"
    >
      {isPending ? "新しい猫を迎えています..." : "🌟 新しい猫を迎える"}
    </button>
  );
}
