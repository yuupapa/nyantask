"use client";

import { useState } from "react";


export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/auth/signout";
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-full py-2.5 text-sm font-semibold text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
    >
      {loading ? "ログアウト中..." : "ログアウト"}
    </button>
  );
}
