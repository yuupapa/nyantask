import { requireAuth } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/types";
import { getOrCreateActiveCat } from "@/app/_actions/cat";
import { CatCard } from "@/app/_components/CatCard";
import { CurrencyDisplay } from "@/app/_components/CurrencyDisplay";
import { SummonNewCatButton } from "@/app/_components/SummonNewCatButton";
import { InstallAppButton } from "@/app/_components/InstallAppButton";
import {
  getCurrentSeason,
  SEASON_BG,
  SEASON_EMOJI,
  SEASON_LABELS,
} from "@/lib/season";
import { getDaysSinceBorn } from "@/lib/cat";
import Link from "next/link";

// 認証絡みのページはキャッシュしない（毎回サーバーで実行）
export const dynamic = "force-dynamic";

export default async function Home() {
  const profile = await requireAuth();
  const season = getCurrentSeason();

  // 活動中の猫を取得（なければ初回付与）+ 時間減衰を反映
  let cat = null;
  let catError: string | null = null;
  try {
    cat = await getOrCreateActiveCat();
  } catch (err) {
    catError = err instanceof Error ? err.message : "unknown";
    console.error("[home] cat fetch error:", err);
  }

  return (
    <main
      className={`min-h-screen flex flex-col items-center p-4 py-8 ${SEASON_BG[season]}`}
    >
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <header className="w-full flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-nyan-pink-deep">にゃんタスク</h1>
            <p className="text-sm text-gray-600 mt-1">
              {profile.display_name ?? profile.email} さん
              <span className="text-xs text-gray-400 ml-2">
                ({ROLE_LABELS[profile.role]})
              </span>
            </p>
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-xs text-gray-500 hover:text-gray-800 transition px-3 py-1 border border-gray-300 rounded-full bg-white/60"
            >
              ログアウト
            </button>
          </form>
        </header>

        {/* 通貨表示 + 季節バッジ */}
        <div className="w-full flex justify-between items-center">
          <span className="text-xs text-gray-600 bg-white/70 px-3 py-1 rounded-full">
            {SEASON_EMOJI[season]} {SEASON_LABELS[season]}のシーズン
          </span>
          <CurrencyDisplay coin={profile.coin} paw={profile.paw} />
        </div>

        {catError && (
          <div className="w-full bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
            <p className="font-semibold">猫の取得に失敗しました</p>
            <p className="text-xs mt-1">
              {catError}
              <br />
              （DBマイグレーション `20260503020000_cats.sql` の実行が必要かも）
            </p>
          </div>
        )}

        {cat && (
          <CatCard
            cat={cat}
            pawBalance={profile.paw}
            hasApiKey={profile.has_gemini_key}
          />
        )}

        {cat && (
          <SummonNewCatButton
            daysAlive={getDaysSinceBorn(cat.born_at)}
            catName={cat.name}
          />
        )}

        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/tasks"
            className="px-8 py-4 bg-nyan-pink-deep text-white rounded-full hover:opacity-80 transition font-semibold text-center shadow-lg"
          >
            📝 やることリストへ
          </Link>

          <Link
            href="/cats"
            className="px-6 py-2 bg-white/80 border border-gray-300 text-gray-700 rounded-full hover:bg-white transition font-semibold text-center"
          >
            📖 ねこ図鑑へ
          </Link>

          <Link
            href="/settings"
            className="px-6 py-2 bg-white/80 border border-gray-300 text-gray-700 rounded-full hover:bg-white transition font-semibold text-center"
          >
            ⚙️ 設定
          </Link>

          {profile.role === "admin" && (
            <Link
              href="/admin"
              className="px-6 py-2 bg-nyan-blue text-gray-800 rounded-full hover:opacity-80 transition font-semibold text-center"
            >
              🛠️ 管理画面へ
            </Link>
          )}

          {/* PWAインストールボタン（インストール可能な環境のみ表示） */}
          <InstallAppButton />
        </div>
      </div>
    </main>
  );
}
