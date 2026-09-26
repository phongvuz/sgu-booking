"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;
    setError("");

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Không thể đăng nhập. Vui lòng thử lại!");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("Không thể kết nối máy chủ. Vui lòng thử lại!");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Email hoặc Số điện thoại
        </label>
        <input
          name="email"
          autoComplete="username"
          maxLength={191}
          type="text"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email hoặc số điện thoại"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ef5222] focus:border-transparent outline-none transition bg-gray-50/50 focus:bg-white text-gray-800 text-sm"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-semibold text-gray-700">
            Mật khẩu
          </label>
          <Link
            href="#"
            className="text-xs font-medium text-[#ef5222] hover:underline"
          >
            Quên mật khẩu?
          </Link>
        </div>
        <div className="relative">
          <input
            name="password"
            autoComplete="current-password"
            maxLength={128}
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ef5222] focus:border-transparent outline-none transition bg-gray-50/50 focus:bg-white text-gray-800 pr-12 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            {showPassword ? "Ẩn" : "Hiện"}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#ef5222] hover:bg-[#d94a1d] disabled:bg-orange-300 text-white font-bold py-3.5 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:cursor-not-allowed text-sm"
      >
        {isPending ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <span>Đang đăng nhập...</span>
          </>
        ) : (
          "Đăng nhập"
        )}
      </button>

      <div className="text-center text-sm text-gray-500 pt-2 border-t">
        Chưa có tài khoản?{" "}
        <Link
          href="/register"
          className="font-bold text-[#ef5222] hover:underline"
        >
          Đăng ký ngay
        </Link>
      </div>
    </form>
  );
}
