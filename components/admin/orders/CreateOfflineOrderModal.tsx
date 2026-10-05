"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { offlineOrderSchema, OfflineOrderFormValues } from "@/lib/validations/order";
import { formatPrice, formatTripTime } from "@/types/trip";

interface TripOption {
  id: number;
  code: string;
  from: string;
  to: string;
  time: string;
  price: number;
  availableSeats: number;
}

interface CreateOfflineOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OfflineOrderFormValues) => Promise<{ success: boolean; message?: string }>;
}

export function CreateOfflineOrderModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateOfflineOrderModalProps) {
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripOption | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OfflineOrderFormValues>({
    resolver: zodResolver(offlineOrderSchema) as any,
    defaultValues: {
      tripId: 0,
      seats: ["A01"],
      fullName: "",
      phone: "",
      status: "CONFIRMED",
    },
  });

  const currentTripId = watch("tripId");
  const seatsWatched = watch("seats");

  useEffect(() => {
    if (isOpen) {
      setLoadingTrips(true);
      fetch("/api/trips?admin=true&limit=50")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setTrips(data.data);
            if (data.data.length > 0) {
              setValue("tripId", data.data[0].id);
              setSelectedTrip(data.data[0]);
            }
          }
        })
        .catch(console.error)
        .finally(() => setLoadingTrips(false));
    } else {
      reset();
      setSelectedTrip(null);
    }
  }, [isOpen, reset, setValue]);

  useEffect(() => {
    if (currentTripId) {
      const found = trips.find((t) => t.id === Number(currentTripId));
      setSelectedTrip(found || null);
    }
  }, [currentTripId, trips]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: OfflineOrderFormValues) => {
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
            <h3 className="font-bold text-gray-900 text-base">Tạo vé tại quầy (Offline)</h3>
            <p className="text-xs text-gray-500">
              Xuất vé nhanh cho khách hàng mua trực tiếp tại phòng vé
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
          {/* Chọn chuyến xe */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Chọn chuyến xe xuất bến <span className="text-rose-500">*</span>
            </label>
            {loadingTrips ? (
              <p className="text-xs text-gray-400">Đang tải danh sách chuyến...</p>
            ) : (
              <select
                {...register("tripId")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#1a9e09] focus:ring-1 focus:ring-[#1a9e09]"
              >
                {trips.map((t) => {
                  const time = formatTripTime(t.time);
                  return (
                    <option key={t.id} value={t.id}>
                      [{t.code}] {t.from} &rarr; {t.to} ({time.departureTime} {time.dateFormatted}) - {formatPrice(t.price)}
                    </option>
                  );
                })}
              </select>
            )}
            {errors.tripId && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.tripId.message}</p>
            )}
          </div>

          {/* Chọn số ghế */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Số ghế đăng ký (cách nhau bởi dấu phẩy) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: A01, A02"
              defaultValue="A01"
              onChange={(e) => {
                const arr = e.target.value
                  .split(",")
                  .map((s) => s.trim().toUpperCase())
                  .filter(Boolean);
                setValue("seats", arr);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold uppercase focus:outline-none focus:border-[#1a9e09] focus:ring-1 focus:ring-[#1a9e09]"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Số ghế trống còn lại: <strong className="text-emerald-600">{selectedTrip?.availableSeats || 0}</strong> ghế
            </p>
          </div>

          {/* Họ tên & SĐT khách */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Họ tên hành khách <span className="text-rose-500">*</span>
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
                Số điện thoại liên hệ <span className="text-rose-500">*</span>
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
          </div>

          {/* Trạng thái thanh toán */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Hình thức thu tiền
            </label>
            <select
              {...register("status")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#1a9e09] focus:ring-1 focus:ring-[#1a9e09]"
            >
              <option value="CONFIRMED">Đã thanh toán (Tiền mặt / Chuyển khoản)</option>
              <option value="PENDING">Giữ chỗ / Chờ thanh toán khi lên xe</option>
            </select>
          </div>

          {/* Tóm tắt tiền */}
          {selectedTrip && (
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-emerald-800 font-semibold block">
                  Tổng tiền dự kiến ({seatsWatched?.length || 1} ghế):
                </span>
                <span className="text-lg font-black text-emerald-700">
                  {formatPrice((selectedTrip.price || 0) * (seatsWatched?.length || 1))}
                </span>
              </div>
              <span className="text-xs text-emerald-700 font-medium">
                Giá gốc: {formatPrice(selectedTrip.price)}/vé
              </span>
            </div>
          )}

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
              {isSubmitting ? "Đang xuất vé..." : "Xác nhận xuất vé"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
