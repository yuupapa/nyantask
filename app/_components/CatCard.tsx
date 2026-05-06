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
  getStatus,
  STATUS_LABELS,
  STATUS_EMOJI,
  xpProgress,
  getAppearance,
  APPEARANCE_DECORATIONS,
  APPEARANCE_BG,
  APPEARANCE_RING,
} from "@/lib/cat";
import { PetCatButton } from "./PetCatButton";
import { CatTalkButton } from "./CatTalkButton";
import { CatNameEditor } from "./CatNameEditor";

type Props = {
  cat: Cat;
  pawBalance: number;
  hasApiKey: boolean;
};

export function CatCard({ cat, pawBalance, hasApiKey }: Props) {
  const stage = getStage(cat.born_at);
  const days = getDaysSinceBorn(cat.born_at);
  const status = getStatus(cat);
  const xp = xpProgress(cat.friendship_xp);
  const appearance = getAppearance({
    friendshipLevel: xp.level,
    status,
  });

  return (
    <div
      className={`rounded-2xl shadow-lg p-6 max-w-md w-full transition-all ${APPEARANCE_BG[appearance]} ${APPEARANCE_RING[appearance]}`}
    >
      {/* 上部：個性 + ステータス */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-xs text-gray-500">
            {STAGE_LABELS[stage]}（{days}日目）
          </div>
          <div className="mt-0.5">
            <CatNameEditor catId={cat.id} initialName={cat.name} />
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {getPatternLabel(cat.pattern)} ／ {getFaceLabel(cat.face)}
          </div>
          <div className="text-xs text-gray-500">
            性格：{getPersonalityLabel(cat.personality)}
          </div>
        </div>
        <div className="text-right">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(status)}`}
          >
            {STATUS_EMOJI[status]} {STATUS_LABELS[status]}
          </span>
        </div>
      </div>

      {/* 中央：絵文字（プレースホルダ） */}
      <div className="flex items-center justify-center my-6 relative">
        <div className="text-7xl drop-shadow-md">
          {getPatternEmoji(cat.pattern)}
        </div>
        {APPEARANCE_DECORATIONS[appearance] && (
          <div className="absolute top-0 right-1/4 text-3xl animate-pulse">
            {APPEARANCE_DECORATIONS[appearance]}
          </div>
        )}
      </div>

      {/* 状態バー */}
      <div className="space-y-3 mb-4">
        <StatBar
          label="🍣 満腹度"
          value={cat.hunger}
          max={100}
          color="bg-orange-400"
        />
        <StatBar
          label="✨ 機嫌"
          value={cat.mood}
          max={100}
          color="bg-pink-400"
        />
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-700 font-semibold">
              💗 なかよし Lv.{xp.level}
            </span>
            <span className="text-xs text-gray-500">
              {xp.current} / {xp.needed} XP
            </span>
          </div>
          <div className="w-full bg-gray-200/80 rounded-full h-2 overflow-hidden">
            <div
              className="bg-nyan-pink-deep h-2 rounded-full transition-all"
              style={{ width: `${xp.pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* なでなで + 話しかける */}
      <div className="space-y-3">
        <PetCatButton pawBalance={pawBalance} />
        <p className="text-[11px] text-gray-500 text-center -mt-1">
          🐾 1 消費で 機嫌 +20、なかよし経験値 +30
        </p>
        <CatTalkButton hasApiKey={hasApiKey} />
      </div>
    </div>
  );
}

function StatBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-700 font-semibold">{label}</span>
        <span className="text-xs text-gray-500">
          {value} / {max}
        </span>
      </div>
      <div className="w-full bg-gray-200/80 rounded-full h-2 overflow-hidden">
        <div
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function statusBadge(status: string): string {
  switch (status) {
    case "happy":
      return "bg-green-100 text-green-800";
    case "normal":
      return "bg-blue-100 text-blue-800";
    case "sad":
      return "bg-yellow-100 text-yellow-800";
    case "sick":
      return "bg-orange-100 text-orange-800";
    case "runaway":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
