import { requireAuth } from "@/lib/auth";
import { getOrCreateActiveCat } from "@/app/_actions/cat";
import { getUserItems } from "@/app/_actions/shop";
import { AuthShell } from "@/app/_components/AuthShell";
import { CurrencyDisplay } from "@/app/_components/CurrencyDisplay";
import { CatRoomClient } from "./_components/CatRoomClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CatPage() {
  const profile = await requireAuth();

  let cat = null;
  try {
    cat = await getOrCreateActiveCat();
  } catch {
    // 猫取得失敗は無視
  }

  const userItems = await getUserItems();

  return (
    <AuthShell>
      <main className="min-h-screen bg-nyan-cream">
        {/* ─── ヘッダー ─── */}
        <header className="bg-nyan-cream sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-1 text-nyan-pink-deep font-bold text-sm"
            >
              ← ホーム
            </Link>
            <h1 className="text-base font-extrabold">
              <span style={{ color: "#FF8FA8" }}>🐾</span>
              <span style={{ color: "#5DAEE8" }}> 育成</span>
            </h1>
            <CurrencyDisplay coin={profile.coin} paw={profile.paw} />
          </div>
        </header>

        <div className="max-w-md mx-auto px-4 pb-8">
          {cat ? (
            <CatRoomClient
              cat={cat}
              userItems={userItems}
              pawBalance={profile.paw}
              hasApiKey={profile.has_gemini_key}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <p className="text-4xl">😿</p>
              <p className="text-gray-500 text-sm">猫がいません</p>
            </div>
          )}
        </div>
      </main>
    </AuthShell>
  );
}
