"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "ホーム", icon: "🏠" },
  { href: "/tasks", label: "ToDo", icon: "📝" },
  { href: "/shop", label: "ショップ", icon: "🛒" },
  { href: "/cats", label: "ねこ", icon: "🐱" },
  { href: "/settings", label: "設定", icon: "⚙️" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-gray-100 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] safe-area-bottom">
      <div className="max-w-md mx-auto flex justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2.5 px-3 text-[10px] transition-colors ${
                isActive
                  ? "text-nyan-pink-deep font-bold"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="text-xl leading-none mb-0.5">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
