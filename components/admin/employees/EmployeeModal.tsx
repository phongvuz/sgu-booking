"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema, EmployeeFormValues } from "@/lib/validations/employee";
import { Employee } from "@/types";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormValues) => Promise<{ success: boolean; message?: string }>;
  initialData?: Employee | null;
  mode: "create" | "edit";
}

const DEFAULT_VALUES: EmployeeFormValues = {
  name: "",
  email: "",
  phone: "",
  role: "Tài xế",
  department: "Đội xe",
  status: "Đang làm việc",
  identityCard: "",
  address: "",
  startDate: new Date().toISOString().slice(0, 10),
  password: "Password@123",
};

export function EmployeeModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: EmployeeModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // Pre-populate fields on edit mode or reset on create
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        reset({
          name: initialData.name,
          email: initialData.email,
          phone: initialData.phone,
          role: initialData.role,
          department: initialData.department,
          status: (initialData.status as any) || "Đang làm việc",
          identityCard: initialData.identityCard || "",
          address: initialData.address || "",
          startDate: initialData.startDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
          password: "",
        });
      } else {
        reset(DEFAULT_VALUES);
      }
    }
  }, [isOpen, mode, initialData, reset]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: EmployeeFormValues) => {
    const result = await onSubmit(data);
    if (result.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#ef5222] text-white flex items-center justify-center font-bold text-lg">
              {mode === "create" ? "+" : "✎"}
            </span>
            <div>
              <h2 className="text-lg font-bold">
                {mode === "create" ? "Thêm nhân viên mới" : "Chỉnh sửa thông tin nhân viên"}
              </h2>
              <p className="text-xs text-slate-300">
                {mode === "create"
                  ? "Điền thông tin bên dưới để tạo hồ sơ nhân viên trong hệ thống"
                  : `Đang cập nhật hồ sơ: ${initialData?.name} (${initialData?.id})`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Họ và tên */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Họ và Tên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                {...register("name")}
                className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.name
                    ? "border-rose-400 focus:ring-rose-200 bg-rose-50/30"
                    : "border-gray-300 focus:ring-orange-200 focus:border-[#ef5222]"
                }`}
              />
              {errors.name && (
                <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Email công việc <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                placeholder="nhanvien@nhaxe.vn"
                {...register("email")}
                className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.email
                    ? "border-rose-400 focus:ring-rose-200 bg-rose-50/30"
                    : "border-gray-300 focus:ring-orange-200 focus:border-[#ef5222]"
                }`}
              />
              {errors.email && (
                <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Số điện thoại <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="0901234567"
                {...register("phone")}
                className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.phone
                    ? "border-rose-400 focus:ring-rose-200 bg-rose-50/30"
                    : "border-gray-300 focus:ring-orange-200 focus:border-[#ef5222]"
                }`}
              />
              {errors.phone && (
                <p className="text-xs text-rose-500 mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Số CCCD / CMND */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Số CCCD / CMND
              </label>
              <input
                type="text"
                placeholder="079201001234"
                {...register("identityCard")}
                className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.identityCard
                    ? "border-rose-400 focus:ring-rose-200 bg-rose-50/30"
                    : "border-gray-300 focus:ring-orange-200 focus:border-[#ef5222]"
                }`}
              />
              {errors.identityCard && (
                <p className="text-xs text-rose-500 mt-1">
                  {errors.identityCard.message}
                </p>
              )}
            </div>

            {/* Vai trò / Chức vụ */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Vai trò / Chức vụ <span className="text-rose-500">*</span>
              </label>
              <select
                {...register("role")}
                className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 bg-white transition-colors cursor-pointer ${
                  errors.role
                    ? "border-rose-400 focus:ring-rose-200 bg-rose-50/30"
                    : "border-gray-300 focus:ring-orange-200 focus:border-[#ef5222]"
                }`}
              >
                <option value="Tài xế">Tài xế</option>
                <option value="Phụ xe">Phụ xe</option>
                <option value="Văn phòng">Văn phòng</option>
                <option value="Quản lý">Quản lý</option>
                <option value="Điều hành">Điều hành</option>
              </select>
              {errors.role && (
                <p className="text-xs text-rose-500 mt-1">{errors.role.message}</p>
              )}
            </div>

            {/* Phòng ban */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Phòng ban <span className="text-rose-500">*</span>
              </label>
              <select
                {...register("department")}
                className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 bg-white transition-colors cursor-pointer ${
                  errors.department
                    ? "border-rose-400 focus:ring-rose-200 bg-rose-50/30"
                    : "border-gray-300 focus:ring-orange-200 focus:border-[#ef5222]"
                }`}
              >
                <option value="Đội xe">Đội xe</option>
                <option value="Phòng vé">Phòng vé</option>
                <option value="Ban điều hành">Ban điều hành</option>
                <option value="Kế toán">Kế toán</option>
                <option value="Kỹ thuật & Bảo dưỡng">Kỹ thuật & Bảo dưỡng</option>
              </select>
              {errors.department && (
                <p className="text-xs text-rose-500 mt-1">
                  {errors.department.message}
                </p>
              )}
            </div>

            {/* Trạng thái làm việc */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Trạng thái làm việc
              </label>
              <select
                {...register("status")}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-[#ef5222] bg-white transition-colors cursor-pointer"
              >
                <option value="Đang làm việc">🟢 Đang làm việc</option>
                <option value="Nghỉ phép">🟡 Nghỉ phép</option>
                <option value="Đã nghỉ việc">🔴 Đã nghỉ việc</option>
              </select>
              {errors.status && (
                <p className="text-xs text-rose-500 mt-1">{errors.status.message}</p>
              )}
            </div>

            {/* Ngày vào làm */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Ngày bắt đầu làm việc <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                {...register("startDate")}
                className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.startDate
                    ? "border-rose-400 focus:ring-rose-200 bg-rose-50/30"
                    : "border-gray-300 focus:ring-orange-200 focus:border-[#ef5222]"
                }`}
              />
              {errors.startDate && (
                <p className="text-xs text-rose-500 mt-1">{errors.startDate.message}</p>
              )}
            </div>
          </div>

          {/* Địa chỉ */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Địa chỉ liên hệ
            </label>
            <input
              type="text"
              placeholder="VD: Quận 1, TP. Hồ Chí Minh"
              {...register("address")}
              className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-[#ef5222] transition-colors"
            />
            {errors.address && (
              <p className="text-xs text-rose-500 mt-1">{errors.address.message}</p>
            )}
          </div>

          {/* Mật khẩu mặc định (chỉ hiển thị khi thêm mới) */}
          {mode === "create" && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Mật khẩu tài khoản mặc định
              </label>
              <input
                type="text"
                placeholder="VD: Password@123"
                {...register("password")}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-[#ef5222] transition-colors bg-gray-50/40"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Nhân viên có thể đổi mật khẩu sau lần đăng nhập đầu tiên.
              </p>
              {errors.password && (
                <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>
              )}
            </div>
          )}

          {/* Modal Actions Footer */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-bold bg-[#ef5222] hover:bg-[#d94a1d] text-white rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                  <span>Đang lưu...</span>
                </>
              ) : mode === "create" ? (
                "Thêm nhân viên"
              ) : (
                "Lưu thay đổi"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
