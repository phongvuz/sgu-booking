"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton({ className = "font-medium text-[#ef5222] disabled:opacity-50" }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function logout() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      router.replace("/login");
      router.refresh();
    } catch { setError("Không thể đăng xuất. Vui lòng thử lại!"); }
    finally { setPending(false); }
  }
  return <div>
    <button onClick={logout} disabled={pending} className={className}>{pending ? "Đang đăng xuất..." : "Đăng xuất"}</button>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
  </div>;
}
