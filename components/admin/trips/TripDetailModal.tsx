"use client";

import React from "react";
import { TripAdminItem } from "@/services/tripService";
import { formatPrice, formatTripTime } from "@/types/trip";

interface TripDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripAdminItem | null;
  onEdit: (trip: TripAdminItem) => void;
}

export function TripDetailModal({
  isOpen,
  onClose,
  trip,
  onEdit,
}: TripDetailModalProps) {
  if (!isOpen || !trip) return null;

  const timeInfo = formatTripTime(trip.time);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded"
          >
            ✕
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#1a9e09] text-white flex items-center justify-center text-2xl font-bold shadow-sm">
              🛣️
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1a9e09] bg-[#1a9e09]/10 px-2 py-0.5 rounded">
                Mã: {trip.code}
              </span>
              <h2 className="text-lg font-extrabold tracking-tight mt-1">
                {trip.from} &rarr; {trip.to}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Xuất bến: {timeInfo.departureTime}, Ngày {timeInfo.dateFormatted}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-center">
            <div>
              <span className="text-[11px] text-gray-500 block">Giá vé</span>
              <span className="font-extrabold text-sm text-[#1a9e09]">
                {formatPrice(trip.price)}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-gray-500 block">Ghế trống</span>
              <span className="font-extrabold text-sm text-gray-900">
                {trip.availableSeats} / {trip.totalSeats}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-gray-500 block">Lấp đầy</span>
              <span className="font-extrabold text-sm text-purple-700">
                {trip.occupancyRate}%
              </span>
            </div>
          </div>

          {/* Bookings Passenger List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                Danh sách hành khách đã đặt chỗ ({trip.bookings.length} vé)
              </span>
            </div>

            {trip.bookings.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400">
                Chưa có khách đặt vé cho chuyến xe này
              </div>
            ) : (
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                {trip.bookings.map((b) => (
                  <div key={b.id} className="p-3 flex items-center justify-between bg-white hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-xs">
                        {b.seatNumber}
                      </span>
                      <div>
                        <p className="font-bold text-gray-900 text-xs">{b.userName}</p>
                        <p className="text-[11px] text-gray-400">{b.userPhone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900 text-xs block">
                        {formatPrice(b.totalPrice)}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          b.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {b.status === "CONFIRMED" ? "Đã thu tiền" : "Chờ thu"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
          >
            Đóng
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(trip);
            }}
            className="px-4 py-2 bg-[#1a9e09] hover:bg-[#1db63e] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Chỉnh sửa chuyến xe
          </button>
        </div>
      </div>
    </div>
  );
}
