import { requireAuth } from "@/lib/auth";
import { getShopItems, getUserItems } from "@/app/_actions/shop";
import { ShopTabs } from "./_components/ShopTabs";
import { InventorySection } from "./_components/InventorySection";
import { CurrencyDisplay } from "@/app/_components/CurrencyDisplay";
import { AuthShell } from "@/app/_components/AuthShell";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const profile = await requireAuth();
  const [shopItems, userItems] = await Promise.all([
    getShopItems(),
    getUserItems(),
  ]);

  return (
    <AuthShell>
    <main className="min-h-screen bg-nyan-cream">
      <header className="bg-white/80 backdrop-blur border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-nyan-pink-deep">🛒 ショップ</h1>
          <CurrencyDisplay coin={profile.coin} paw={profile.paw} />
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6">
        <ShopTabs
          items={shopItems}
          coinBalance={profile.coin}
          userItems={userItems}
        />

        <InventorySection items={userItems.filter((ui) => ui.shop_item.category !== "food")} />
      </div>
    </main>
    </AuthShell>
  );
}
