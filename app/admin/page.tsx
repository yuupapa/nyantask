import { createClient } from "@/lib/supabase/server";
import { USER_ROLES, ROLE_LABELS, type UserRole } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // 全ユーザーをロール別に集計
  const { data: profiles } = await supabase.from("profiles").select("role");

  const roleCounts: Record<UserRole, number> = {
    admin: 0,
    general: 0,
  };

  profiles?.forEach((p: { role: string }) => {
    if (p.role in roleCounts) {
      roleCounts[p.role as UserRole]++;
    }
  });

  const total = profiles?.length ?? 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">ダッシュボード</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="総ユーザー数" value={total} />
        <StatCard label="管理者" value={roleCounts.admin} />
        <StatCard label="一般ユーザー" value={roleCounts.general} />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-bold mb-4">ロール内訳</h3>
        <div className="space-y-3">
          {USER_ROLES.map((r) => (
            <RoleRow
              key={r}
              label={ROLE_LABELS[r]}
              count={roleCounts[r]}
              color={roleColor(r)}
            />
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
        <p className="font-semibold mb-1">💡 ヒント</p>
        <p>
          Google ログインしたユーザーは自動的に「一般」ロールで登録されます。
          管理者にしたい場合は「ユーザー」タブから該当ユーザーのロールを変更してください。
        </p>
      </div>
    </div>
  );
}

function roleColor(role: UserRole): string {
  switch (role) {
    case "admin":
      return "bg-nyan-pink-deep";
    default:
      return "bg-gray-300";
  }
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-3xl font-bold mt-2">{value}</div>
    </div>
  );
}

function RoleRow({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className={`w-3 h-3 rounded-full ${color}`} />
        <span className="text-sm">{label}</span>
      </div>
      <span className="font-bold">{count}</span>
    </div>
  );
}
