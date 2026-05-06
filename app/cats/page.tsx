import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Cat } from "@/lib/types";
import Link from "next/link";
import { CatThumb } from "./_components/CatThumb";
import { getCurrentSeason, SEASON_BG, SEASON_EMOJI, SEASON_LABELS } from "@/lib/season";

export const dynamic = "force-dynamic";

export default async function CatsPage() {
  const profile = await requireAuth();
  const supabase = await createClient();
  const season = getCurrentSeason();

  const { data: allCats } = await supabase
    .from("cats")
    .select(
      "id, user_id, name, pattern, face, personality, rarity, hunger, mood, friendship_xp, is_active, is_runaway, born_at, last_decay_at, created_at"
    )
    .eq("user_id", profile.id)
    .order("born_at", { ascending: false });

  const cats = (allCats ?? []) as Cat[];
  const activeCat = cats.find((c) => c.is_active) ?? null;
  const retiredCats = cats.filter((c) => !c.is_active);

  // 出会った組み合わせの集計（柄ベース、Phase 1.5 シンプル版）
  const uniquePatterns = new Set(cats.map((c) => c.pattern));

  return (
    <main className={`min-h-screen ${SEASON_BG[season]}`}>
      <header className="bg-white/70 backdrop-blur border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-nyan-pink-deep">
            📖 ねこ図鑑
            <span className="ml-2 text-xs font-normal text-gray-500">
              {SEASON_EMOJI[season]} {SEASON_LABELS[season]}
            </span>
          </h1>
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-nyan-pink-deep transition"
          >
            ← ホームへ
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-4 space-y-6">
        {/* 収集サマリー */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold mb-3">収集状況</h2>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="出会った数" value={cats.length} />
            <Stat label="殿堂入り" value={retiredCats.length} />
            <Stat label="柄の種類" value={uniquePatterns.size} suffix=" / 12" />
          </div>
        </div>

        {/* 育成中 */}
        {activeCat ? (
          <section>
            <h2 className="font-bold mb-3">🌟 育成中</h2>
            <CatThumb cat={activeCat} />
          </section>
        ) : (
          <section className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 text-sm">育てている猫がいません</p>
            <Link
              href="/"
              className="inline-block mt-3 px-6 py-2 bg-nyan-pink-deep text-white rounded-full hover:opacity-80 text-sm"
            >
              ホームから猫を迎える
            </Link>
          </section>
        )}

        {/* 殿堂入り */}
        {retiredCats.length > 0 && (
          <section>
            <h2 className="font-bold mb-3">
              🏆 殿堂入り（{retiredCats.length}匹）
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {retiredCats.map((c) => (
                <CatThumb key={c.id} cat={c} small />
              ))}
            </div>
          </section>
        )}

        {retiredCats.length === 0 && (
          <p className="text-xs text-gray-500 text-center pt-2">
            育成中の猫が若猫（15日目）以上になったら、ホームから新しい猫を迎えられます。
            <br />
            これまでの猫は殿堂入りとして図鑑に永続記録されます。
          </p>
        )}
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="text-center">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="text-2xl font-bold mt-1">
        {value}
        {suffix && <span className="text-xs text-gray-400">{suffix}</span>}
      </div>
    </div>
  );
}
