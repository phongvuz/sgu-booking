"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tripSchema, TripFormValues } from "@/lib/validations/trip";
import { TripAdminItem } from "@/services/tripService";

interface TripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TripFormValues) => Promise<{ success: boolean; message?: string }>;
  initialData?: TripAdminItem | null;
  mode: "create" | "edit";
}

export function TripModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: TripModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema) as any,
    defaultValues: {
      code: "",
      from: "Hồ Chí Minh",
      to: "Đà Lạt",
      time: "",
      price: 300000,
      availableSeats: 30,
    },
  });

  useEffect(() => {
    if (initialData && mode === "edit") {
      const isoTime = initialData.time ? new Date(initialData.time).toISOString().slice(0, 16) : "";
      reset({
        code: initialData.code,
        from: initialData.from,
        to: initialData.to,
        time: isoTime,
        price: initialData.price,
        availableSeats: initialData.availableSeats,
      });
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(8, 0, 0, 0);
      reset({
        code: "",
        from: "Hồ Chí Minh",
        to: "Đà Lạt",
        time: tomorrow.toISOString().slice(0, 16),
        price: 300000,
        availableSeats: 30,
      });
    }
  }, [initialData, mode, reset, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: TripFormValues) => {
    const res = await onSubmit(data);
    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-900 text-base">
              {mode === "create" ? "Thêm chuyến xe mới" : `Cập nhật chuyến ${initialData?.code}`}
            </h3>
            <p className="text-xs text-gray-500">
              Thiết lập lộ trình điểm đi, điểm đến, giờ xuất bến và giá vé
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
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Mã chuyến xe */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Mã chuyến xe (Tùy chọn - để trống hệ thống sẽ tự sinh)
            </label>
            <input
              type="text"
              placeholder="VD: SG-DL-03"
              disabled={mode === "edit"}
              {...register("code")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold uppercase focus:outline-none focus:border-[#1a9e09] focus:ring-1 focus:ring-[#1a9e09] disabled:bg-gray-100"
            />
            {errors.code && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.code.message}</p>
            )}
          </div>

          {/* Lộ trình Điểm đi & Điểm đến */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Điểm khởi hành <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: Hồ Chí Minh"
                {...register("from")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#1a9e09] focus:ring-1 focus:ring-[#1a9e09]"
              />
              {errors.from && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.from.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Điểm đến <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: Đà Lạt"
                {...register("to")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#1a9e09] focus:ring-1 focus:ring-[#1a9e09]"
              />
              {errors.to && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.to.message}</p>
              )}
            </div>
          </div>

          {/* Thời gian xuất bến */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Thời gian xuất bến <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              {...register("time")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#1a9e09] focus:ring-1 focus:ring-[#1a9e09]"
            />
            {errors.time && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.time.message}</p>
            )}
          </div>

          {/* Giá vé & Số ghế trống */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Giá vé (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="10000"
                placeholder="300000"
                {...register("price")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:border-[#1a9e09] focus:ring-1 focus:ring-[#1a9e09]"
              />
              {errors.price && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Số ghế trống <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                {...register("availableSeats")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#1a9e09] focus:ring-1 focus:ring-[#1a9e09]"
              />
              {errors.availableSeats && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.availableSeats.message}</p>
              )}
            </div>
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
              {isSubmitting ? "Đang lưu..." : mode === "create" ? "Tạo chuyến xe" : "Cập nhật chuyến xe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
