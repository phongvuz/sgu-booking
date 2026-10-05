"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, UserFormValues } from "@/lib/validations/user";
import { UserAccount } from "@/types";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormValues) => Promise<{ success: boolean; message?: string }>;
  initialData?: UserAccount | null;
  mode: "create" | "edit";
}

export function UserModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: UserModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema) as any,
    defaultValues: {
      fullName: "",
      phone: "",
      password: "",
      role: "USER",
    },
  });

  useEffect(() => {
    if (initialData && mode === "edit") {
      reset({
        fullName: initialData.fullName,
        phone: initialData.phone,
        password: "",
        role: initialData.role as any,
      });
    } else {
      reset({
        fullName: "",
        phone: "",
        password: "password123",
        role: "USER",
      });
    }
  }, [initialData, mode, reset, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: UserFormValues) => {
    const res = await onSubmit(data);
    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-900 text-base">
              {mode === "create" ? "Tạo tài khoản mới" : `Cập nhật tài khoản #${initialData?.id}`}
            </h3>
            <p className="text-xs text-gray-500">
              Thông tin định danh và phân quyền người dùng trong hệ thống
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg p-1 rounded"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Nguyễn Văn An"
              {...register("fullName")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#1a9e09] focus:ring-1 focus:ring-[#1a9e09]"
            />
            {errors.fullName && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Số điện thoại <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: 0901234567"
              {...register("phone")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#1a9e09] focus:ring-1 focus:ring-[#1a9e09]"
            />
            {errors.phone && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Mật khẩu {mode === "edit" ? "(Để trống nếu không đổi)" : "(Tối thiểu 6 ký tự)"}
            </label>
            <input
              type="password"
              placeholder={mode === "edit" ? "••••••••" : "Nhập mật khẩu..."}
              {...register("password")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#1a9e09] focus:ring-1 focus:ring-[#1a9e09]"
            />
            {errors.password && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Phân quyền tài khoản <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("role")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#1a9e09] focus:ring-1 focus:ring-[#1a9e09]"
            >
              <option value="USER">Khách hàng thông thường (USER)</option>
              <option value="ADMIN">Quản trị viên hệ thống (ADMIN)</option>
            </select>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#1a9e09] hover:bg-[#1db63e] text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Đang lưu..." : mode === "create" ? "Tạo tài khoản" : "Cập nhật tài khoản"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
