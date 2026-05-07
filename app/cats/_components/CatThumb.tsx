import type { Cat } from "@/lib/types";
import {
  getPatternLabel,
  getFaceLabel,
  getPersonalityLabel,
} from "@/lib/cat-traits";
import {
  getStage,
  getDaysSinceBorn,
  STAGE_LABELS,
  xpProgress,
  getStatus,
} from "@/lib/cat";
import { CatImage } from "@/app/_components/CatImage";

type Props = {
  cat: Cat;
  small?: boolean;
};

export function CatThumb({ cat, small = false }: Props) {
  const stage = getStage(cat.born_at);
  const days = getDaysSinceBorn(cat.born_at);
  const xp = xpProgress(cat.friendship_xp);
  const status = getStatus(cat);

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border ${
        cat.is_active ? "border-nyan-pink" : "border-gray-100"
      } p-4`}
    >
      <div className="flex items-center gap-3">
        <CatImage
          visualId={cat.visual_id}
          pattern={cat.pattern}
          face={cat.face}
          status={status}
          size={small ? 64 : 80}
        />
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
