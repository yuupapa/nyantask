"use client";

import { useTransition } from "react";
import { updateUserRole } from "../_actions";
import { USER_ROLES, ROLE_LABELS, type UserRole } from "@/lib/types";

type Props = {
  userId: string;
  currentRole: UserRole;
  isSelf: boolean;
};

export function RoleSelector({ userId, currentRole, isSelf }: Props) {
  const [isPending, startTransition] = useTransition();

  if (isSelf) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded font-semibold ${roleBadge(currentRole)}`}
      >
        {ROLE_LABELS[currentRole]}
        <span className="text-[10px] font-normal opacity-70">（自分）</span>
      </span>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    if (newRole === currentRole) return;

    if (
      !confirm(
        `このユーザーのロールを「${ROLE_LABELS[currentRole]}」→「${ROLE_LABELS[newRole]}」に変更しますか？`
      )
    ) {
      e.target.value = currentRole;
      return;
    }

    startTransition(async () => {
      try {
        await updateUserRole(userId, newRole);
      } catch (err) {
        alert(
          "ロール変更に失敗しました: " +
            (err instanceof Error ? err.message : "不明なエラー")
        );
        e.target.value = currentRole;
      }
    });
  };

  return (
    <select
      defaultValue={currentRole}
      disabled={isPending}
      onChange={handleChange}
      className={`px-2 py-1 text-xs rounded border font-semibold focus:outline-none focus:ring-2 focus:ring-nyan-pink-deep disabled:opacity-50 ${roleBadge(currentRole)}`}
    >
      {USER_ROLES.map((r) => (
        <option key={r} value={r} className="bg-white text-gray-800">
          {ROLE_LABELS[r]}
        </option>
      ))}
    </select>
  );
}

function roleBadge(role: string): string {
  switch (role) {
    case "admin":
      return "bg-nyan-pink-deep text-white border-nyan-pink-deep";
    case "consultant_student":
      return "bg-nyan-blue text-white border-nyan-blue";
    case "member":
      return "bg-nyan-mint text-gray-800 border-nyan-mint";
    default:
      return "bg-gray-200 text-gray-700 border-gray-300";
  }
}
