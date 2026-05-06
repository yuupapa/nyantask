import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import type { UserRole } from "@/lib/types";
import { RoleSelector } from "./_components/RoleSelector";

export const dynamic = "force-dynamic";

type ProfileRow = {
  id: string;
  email: string;
  display_name: string | null;
  role: UserRole;
  created_at: string;
  last_seen_at: string;
};

export default async function UsersPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { data: users, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, role, created_at, last_seen_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/users] fetch error:", error);
  }

  const rows = (users ?? []) as ProfileRow[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">ユーザー一覧</h2>
        <span className="text-sm text-gray-600">{rows.length}名</span>
      </div>

      <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded p-3">
        💡 ロール列のドロップダウンを変更すると、即座にそのユーザーのロールが変更されます（自分自身は変更不可）。
      </p>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <Th>表示名</Th>
              <Th>メール</Th>
              <Th>ロール</Th>
              <Th>登録日</Th>
              <Th>最終ログイン</Th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {rows.map((u) => (
              <tr key={u.id}>
                <Td>{u.display_name ?? "—"}</Td>
                <Td className="font-mono text-xs">{u.email}</Td>
                <Td>
                  <RoleSelector
                    userId={u.id}
                    currentRole={u.role}
                    isSelf={admin.id === u.id}
                  />
                </Td>
                <Td className="text-gray-500 text-xs">{formatDate(u.created_at)}</Td>
                <Td className="text-gray-500 text-xs">{formatDate(u.last_seen_at)}</Td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  ユーザーはまだいません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 text-sm ${className}`}>{children}</td>;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
