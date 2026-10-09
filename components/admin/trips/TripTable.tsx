"use client";

import { FaRoad } from "react-icons/fa";
import { FiArrowRight, FiEdit, FiEye, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import React from "react";
import { TripAdminItem } from "@/types/trip";
import { formatPrice, formatTripTime } from "@/lib/trip-display";

interface TripTableProps {
  trips: TripAdminItem[];
  loading: boolean;
  onEdit: (trip: TripAdminItem) => void;
  onDelete: (trip: TripAdminItem) => void;
  onView: (trip: TripAdminItem) => void;
}

export function TripTable({
  trips,
  loading,
  onEdit,
  onDelete,
  onView,
}: TripTableProps) {
  if (loading) {
    return (
      <div className="py-16 text-center text-gray-400">
        <div className="inline-block animate-spin text-2xl mb-2"><FiRefreshCw aria-hidden="true" className="inline-block shrink-0 align-middle" /></div>
        <p className="text-xs">Đang tải danh sách tuyến chuyến...</p>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="py-16 text-center text-gray-500">
        <span className="text-4xl block mb-2"><FaRoad aria-hidden="true" className="inline-block shrink-0 align-middle" /></span>
        <p className="text-sm font-semibold">Không tìm thấy chuyến xe nào</p>
        <p className="text-xs text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc tạo chuyến mới</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs text-left">
        <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
          <tr>
            <th className="px-5 py-3.5">Mã Chuyến</th>
            <th className="px-5 py-3.5">Lộ trình Tuyến</th>
            <th className="px-5 py-3.5">Thời gian xuất bến</th>
            <th className="px-5 py-3.5">Giá vé</th>
            <th className="px-5 py-3.5">Tình trạng chỗ</th>
            <th className="px-5 py-3.5 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {trips.map((trip) => {
            const timeInfo = formatTripTime(trip.time);
            return (
              <tr key={trip.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-5 py-3.5 font-bold text-gray-900">
                  <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded font-extrabold text-brand-primary">
                    {trip.id}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900 text-sm">
                    <span>{trip.from}</span>
                    <span className="text-gray-400 font-normal"><FiArrowRight aria-hidden="true" className="inline-block shrink-0 align-middle" /></span>
                    <span>{trip.to}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <p className="font-bold text-gray-900">{timeInfo.departureTime}</p>
                  <p className="text-[11px] text-gray-500">{timeInfo.dateFormatted}</p>
                </td>
                <td className="px-5 py-3.5 font-bold text-gray-900 text-sm">
                  {formatPrice(trip.price)}
                </td>
                <td className="px-5 py-3.5 min-w-[140px]">
                  <div className="flex items-center justify-between text-[11px] font-medium mb-1">
                    <span className="text-gray-500">
                      Trống: <strong className="text-emerald-700">{trip.availableSeats}</strong>/{trip.totalSeats}
                    </span>
                    <span className="font-bold text-purple-700">{trip.occupancyRate}%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all rounded-full ${
                        trip.occupancyRate >= 80
                          ? "bg-rose-500"
                          : trip.occupancyRate >= 50
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, trip.occupancyRate)}%` }}
                    />
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      aria-label="Xem danh sách khách và ghế"
                      onClick={() => onView(trip)}
                      className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                      title="Xem danh sách khách và ghế"
                    >
                      <FiEye aria-hidden="true" className="inline-block shrink-0 align-middle" />
                    </button>
                    <button
                      aria-label="Chỉnh sửa chuyến xe"
                      onClick={() => onEdit(trip)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Chỉnh sửa chuyến xe"
                    >
                      <FiEdit aria-hidden="true" className="inline-block shrink-0 align-middle" />
                    </button>
                    <button
                      aria-label="Xóa chuyến xe"
                      onClick={() => onDelete(trip)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Xóa chuyến xe"
                    >
                      <FiTrash2 aria-hidden="true" className="inline-block shrink-0 align-middle" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
