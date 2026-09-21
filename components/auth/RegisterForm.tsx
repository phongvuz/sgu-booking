"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: true,
  });
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không trùng khớp!");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    setIsPending(true);
    // TODO: Gọi Server Action hoặc API đăng ký tại đây
    setTimeout(() => {
      setIsPending(false);
      alert("Đăng ký thành công!");
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3.5 py-2.5 rounded-xl flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Họ và tên */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Họ và tên <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="Nguyễn Văn A"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ef5222] outline-none transition bg-gray-50/50 focus:bg-white text-gray-800 text-sm"
        />
      </div>

      {/* Số điện thoại */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Số điện thoại <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          required
          pattern="[0-9]{10}"
          placeholder="0912345678"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ef5222] outline-none transition bg-gray-50/50 focus:bg-white text-gray-800 text-sm"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          placeholder="example@gmail.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ef5222] outline-none transition bg-gray-50/50 focus:bg-white text-gray-800 text-sm"
        />
      </div>

      {/* Mật khẩu */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Mật khẩu <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            placeholder="Tối thiểu 6 ký tự"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ef5222] outline-none transition bg-gray-50/50 focus:bg-white text-gray-800 pr-12 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600"
          >
            {showPassword ? "Ẩn" : "Hiện"}
          </button>
        </div>
      </div>

      {/* Xác nhận mật khẩu */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Nhập lại mật khẩu <span className="text-red-500">*</span>
        </label>
        <input
          type={showPassword ? "text" : "password"}
          required
          placeholder="Nhập lại mật khẩu phía trên"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ef5222] outline-none transition bg-gray-50/50 focus:bg-white text-gray-800 text-sm"
        />
      </div>

      {/* Checkbox điều khoản */}
      <div className="flex items-center gap-2 pt-1">
        <input
          id="terms"
          type="checkbox"
          checked={formData.agreeTerms}
          onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
          required
          className="w-4 h-4 text-[#ef5222] accent-[#ef5222] rounded cursor-pointer"
        />
        <label htmlFor="terms" className="text-xs text-gray-600 cursor-pointer">
          Tôi đồng ý với{" "}
          <Link href="#" className="text-[#ef5222] hover:underline font-medium">
            Điều khoản dịch vụ & Chính sách bảo mật
          </Link>
        </label>
      </div>

      {/* Nút submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full mt-2 bg-[#ef5222] hover:bg-[#d94a1d] disabled:bg-orange-300 text-white font-bold py-3.5 px-4 rounded-xl transition duration-200 shadow-md cursor-pointer disabled:cursor-not-allowed text-sm"
      >
        {isPending ? "Đang tạo tài khoản..." : "Đăng ký tài khoản"}
      </button>

      <div className="text-center text-sm text-gray-500 pt-3 border-t">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-bold text-[#ef5222] hover:underline">
          Đăng nhập
        </Link>
      </div>
    </form>
  );
}
