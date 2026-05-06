import type { Cat } from "@/lib/types";
import {
  getPatternLabel,
  getPatternEmoji,
  getFaceLabel,
  getPersonalityLabel,
} from "@/lib/cat-traits";
import {
  getStage,
  getDaysSinceBorn,
  STAGE_LABELS,
  xpProgress,
} from "@/lib/cat";

type Props = {
  cat: Cat;
  small?: boolean;
};

export function CatThumb({ cat, small = false }: Props) {
  const stage = getStage(cat.born_at);
  const days = getDaysSinceBorn(cat.born_at);
  const xp = xpProgress(cat.friendship_xp);

  return (
    <div
      className={`bg-white rounded-xl shadow border ${
        cat.is_active ? "border-nyan-pink" : "border-gray-200 opacity-90"
      } p-4`}
    >
      <div className="flex items-center gap-3">
        <div className={small ? "text-4xl" : "text-5xl"}>
          {getPatternEmoji(cat.pattern)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm truncate">{cat.name}</span>
            {cat.is_active && (
              <span className="text-[10px] bg-nyan-pink-deep text-white rounded px-1.5 py-0.5">
                育成中
              </span>
            )}
          </div>
          <div className="text-[11px] text-gray-600 truncate">
            {getPatternLabel(cat.pattern)}・{getFaceLabel(cat.face)}
          </div>
          <div className="text-[11px] text-gray-500 truncate">
            性格：{getPersonalityLabel(cat.personality)}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">
            {STAGE_LABELS[stage]}（{days}日目）／ Lv.{xp.level}
          </div>
        </div>
      </div>
    </div>
  );
}
