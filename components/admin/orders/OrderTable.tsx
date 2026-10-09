"use client";

import React from "react";
import { OrderItem, BookingStatus } from "@/types";
import { formatPrice, formatTripTime } from "@/lib/trip-display";

interface OrderTableProps {
  orders: OrderItem[];
  loading: boolean;
  onView: (order: OrderItem) => void;
  onUpdateStatus: (order: OrderItem, status: BookingStatus) => void;
  onCancel: (order: OrderItem) => void;
}

export function OrderTable({
  orders,
  loading,
  onView,
  onUpdateStatus,
  onCancel,
}: OrderTableProps) {
  if (loading) {
    return (
      <div className="py-16 text-center text-gray-400">
        <div className="inline-block animate-spin text-2xl mb-2">🔄</div>
        <p className="text-xs">Đang tải danh sách đơn vé...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center text-gray-500">
        <span className="text-4xl block mb-2">🎫</span>
        <p className="text-sm font-semibold">Không tìm thấy đơn vé nào</p>
        <p className="text-xs text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs text-left">
        <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
          <tr>
            <th className="px-5 py-3.5">Mã Vé (PNR)</th>
            <th className="px-5 py-3.5">Khách hàng</th>
            <th className="px-5 py-3.5">Tuyến & Giờ đi</th>
            <th className="px-5 py-3.5">Số ghế</th>
            <th className="px-5 py-3.5">Tổng tiền</th>
            <th className="px-5 py-3.5">Trạng thái</th>
            <th className="px-5 py-3.5 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => {
            const timeInfo = formatTripTime(order.trip.time);
            return (
              <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-5 py-3.5">
                  <span className="font-bold text-gray-900 block">{order.pnr}</span>
                  <span className="text-[10px] text-gray-400">ID: #{order.id}</span>
                </td>
                <td className="px-5 py-3.5">
                  <p className="font-bold text-gray-900">{order.user.fullName}</p>
                  <p className="text-[11px] text-gray-500">{order.user.phone}</p>
                </td>
                <td className="px-5 py-3.5">
                  <p className="font-semibold text-gray-800">
                    {order.trip.from} &rarr; {order.trip.to}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {timeInfo.departureTime} • {timeInfo.dateFormatted} ({order.trip.id})
                  </p>
                </td>
                <td className="px-5 py-3.5">
                  <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold rounded-md text-xs border border-emerald-200">
                    {order.seatNumber}
                  </span>
                </td>
                <td className="px-5 py-3.5 font-bold text-gray-900 text-sm">
                  {formatPrice(order.totalPrice)}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      order.status === "CONFIRMED"
                        ? "bg-emerald-100 text-emerald-800"
                        : order.status === "PENDING"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        order.status === "CONFIRMED"
                          ? "bg-emerald-500"
                          : order.status === "PENDING"
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                    />
                    <span>
                      {order.status === "CONFIRMED"
                        ? "Đã xác nhận"
                        : order.status === "PENDING"
                        ? "Chờ thanh toán"
                        : "Đã hủy"}
                    </span>
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onView(order)}
                      className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                      title="Xem chi tiết vé"
                    >
                      👁️
                    </button>

                    {order.status === "PENDING" && (
                      <button
                        onClick={() => onUpdateStatus(order, "CONFIRMED")}
                        className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold rounded text-[11px] transition-colors"
                        title="Xác nhận thanh toán"
                      >
                        Thu tiền
                      </button>
                    )}

                    {order.status === "CANCELLED" && new Date(order.trip.time) > new Date() && (
                      <button onClick={() => onUpdateStatus(order, "PENDING")} className="px-2 py-1 text-blue-700 hover:bg-blue-50 rounded text-[11px]">
                        Khôi phục
                      </button>
                    )}
                    {order.status !== "CANCELLED" && new Date(order.trip.time) > new Date() && (
                      <button
                        onClick={() => onCancel(order)}
                        className="px-2 py-1 text-rose-600 hover:bg-rose-50 font-semibold rounded text-[11px] transition-colors"
                        title="Hủy vé"
                      >
                        Hủy
                      </button>
                    )}
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
