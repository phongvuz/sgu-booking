"use client";

import { FiAlertTriangle, FiArrowRight } from "react-icons/fi";
import React from "react";
import { TripAdminItem } from "@/types/trip";

interface DeleteTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripAdminItem | null;
  onConfirmDelete: (id: number) => Promise<{ success: boolean; message?: string }>;
}

export function DeleteTripModal({
  isOpen,
  onClose,
  trip,
  onConfirmDelete,
}: DeleteTripModalProps) {
  const [loading, setLoading] = React.useState(false);

  if (!isOpen || !trip) return null;

  const handleDelete = async () => {
    setLoading(true);
    const res = await onConfirmDelete(trip.id);
    setLoading(false);
    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-sm overflow-hidden p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xl mx-auto mb-4 font-bold">
          <FiAlertTriangle aria-hidden="true" className="inline-block shrink-0 align-middle" />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">
          Xác nhận xóa chuyến xe
        </h3>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Bạn có chắc chắn muốn xóa chuyến xe <strong className="text-gray-900">{trip.id}</strong> ({trip.from} <FiArrowRight aria-hidden="true" className="inline-block shrink-0 align-middle" /> {trip.to})?
          {trip.bookedSeatsCount > 0 && (
            <span className="text-rose-600 font-bold block mt-1">
              Cảnh báo: Đang có {trip.bookedSeatsCount} vé đã đặt cho chuyến này!
            </span>
          )}
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? "Đang xóa..." : "Xác nhận xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}
