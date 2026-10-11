"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton({ className = "font-medium text-brand-primary disabled:opacity-50", redirectTo = "/" }: { className?: string; redirectTo?: "/" | "/admin/login" }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  async function logout() {
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      if (!response.ok) throw new Error();
      router.replace(redirectTo);
      router.refresh();
    } catch { setError("Không thể đăng xuất. Vui lòng thử lại!"); }
    finally { submitting.current = false; setPending(false); }
  }
  return <div>
    <button onClick={logout} disabled={pending} className={className}>{pending ? "Đang đăng xuất..." : "Đăng xuất"}</button>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
  </div>;
}
