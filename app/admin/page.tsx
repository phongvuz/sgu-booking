"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { DashboardStats } from "@/types";
import { formatPrice } from "@/types/trip";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/stats?_t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Không thể tải dữ liệu thống kê");
      }
      setStats(data.data);
    } catch (err: any) {
      console.error("Lỗi khi tải thống kê:", err);
      setError(err?.message || "Có lỗi xảy ra khi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Bảng điều khiển hệ thống
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Tổng hợp dữ liệu doanh thu, vé bán, hoạt động phương tiện và nhân sự nhà xe
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadStats()}
            disabled={loading}
            className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg shadow-2xs transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span className={loading ? "animate-spin" : ""}>🔄</span>
            <span>Làm mới dữ liệu</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadStats()}
            className="text-xs font-semibold text-rose-800 underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Doanh thu tháng này */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Doanh thu tháng này
            </span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">
              💰
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-gray-900">
              {loading ? (
                <div className="h-8 bg-gray-200 animate-pulse rounded-md w-36"></div>
              ) : (
                formatPrice(stats?.revenueThisMonth || 0)
              )}
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
              <span>↑ {stats?.revenueGrowthPercent || 0}%</span>
              <span className="text-gray-400">so với tháng trước</span>
            </p>
          </div>
        </div>

        {/* Vé bán hôm nay */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Vé bán hôm nay
            </span>
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
              🎫
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-gray-900">
              {loading ? (
                <div className="h-8 bg-gray-200 animate-pulse rounded-md w-20"></div>
              ) : (
                `${stats?.ticketsSoldToday || 0} vé`
              )}
            </div>
            <p className="text-xs text-blue-600 font-medium mt-1.5 flex items-center gap-1">
              <span>↑ {stats?.ticketsGrowthPercent || 0}%</span>
              <span className="text-gray-400">so với hôm qua</span>
            </p>
          </div>
        </div>

        {/* Xe hoạt động */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Xe đang hoạt động
            </span>
            <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-sm font-bold">
              🚐
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-gray-900">
              {loading ? (
                <div className="h-8 bg-gray-200 animate-pulse rounded-md w-24"></div>
              ) : (
                `${stats?.activeBuses || 0} / ${stats?.totalBuses || 0}`
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              {(stats?.totalBuses || 0) - (stats?.activeBuses || 0)} xe đang bảo dưỡng/nghỉ
            </p>
          </div>
        </div>

        {/* Nhân sự làm việc */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Nhân viên làm việc
            </span>
            <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-sm font-bold">
              👥
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-gray-900">
              {loading ? (
                <div className="h-8 bg-gray-200 animate-pulse rounded-md w-24"></div>
              ) : (
                `${stats?.activeEmployees || 0} / ${stats?.totalEmployees || 0}`
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Tài xế, Phụ xe, Văn phòng vé
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold tracking-tight">Thao tác quản trị nhanh</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Các tính năng thường dùng được chuẩn bị sẵn sàng cho điều phối viên
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/orders"
            className="px-3.5 py-2 bg-[#1a9e09] hover:bg-[#1db63e] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <span>➕</span>
            <span>Bán vé tại quầy</span>
          </Link>
          <Link
            href="/admin/trips"
            className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <span>🛣️</span>
            <span>Thêm chuyến xe</span>
          </Link>
          <Link
            href="/admin/buses"
            className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <span>🚐</span>
            <span>Thêm xe</span>
          </Link>
          <Link
            href="/admin/employees"
            className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <span>👥</span>
            <span>Thêm nhân viên</span>
          </Link>
        </div>
      </div>

      {/* Main Content Grid: Recent Orders & System Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Đơn hàng mới nhất */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden lg:col-span-2">
          <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Đơn đặt vé gần đây</h3>
              <p className="text-xs text-gray-500">Các giao dịch đặt vé trực tuyến và tại quầy</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-[#1a9e09] hover:underline"
            >
              Xem tất cả &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Mã vé / PNR</th>
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-4 py-3">Tuyến & Ghế</th>
                  <th className="px-4 py-3">Số tiền</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      Đang tải danh sách đơn vé...
                    </td>
                  </tr>
                ) : !stats?.recentOrders || stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      Chưa có đơn đặt vé nào trong hệ thống
                    </td>
                  </tr>
                ) : (
                  stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-gray-900">
                        {order.pnr}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{order.user.fullName}</p>
                        <p className="text-[11px] text-gray-400">{order.user.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">
                          {order.trip.from} &rarr; {order.trip.to}
                        </p>
                        <p className="text-[11px] text-emerald-600 font-semibold">
                          Ghế: {order.seatNumber}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">
                        {formatPrice(order.totalPrice)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status === "CONFIRMED"
                              ? "bg-emerald-100 text-emerald-700"
                              : order.status === "PENDING"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {order.status === "CONFIRMED"
                            ? "Đã xác nhận"
                            : order.status === "PENDING"
                            ? "Chờ thanh toán"
                            : "Đã hủy"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Thông báo & Trạng thái hệ thống */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="font-bold text-gray-900 text-base">Cảnh báo hệ thống</h3>
              <span className="text-[11px] font-semibold text-gray-400">Thời gian thực</span>
            </div>

            <div className="space-y-4 mt-4">
              {stats?.systemAlerts?.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3">
                  <div
                    className={`w-2.5 h-2.5 mt-1 rounded-full shrink-0 ${
                      alert.type === "warning"
                        ? "bg-amber-500"
                        : alert.type === "success"
                        ? "bg-emerald-500"
                        : alert.type === "danger"
                        ? "bg-rose-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-800">{alert.title}</p>
                    <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
                      {alert.message}
                    </p>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      {alert.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 flex items-center justify-between">
              <span className="font-medium">Tổng chuyến xe trong cơ sở dữ liệu:</span>
              <span className="font-bold text-gray-900 text-sm">
                {stats?.totalTrips || 0}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 flex items-center justify-between mt-2">
              <span className="font-medium">Tổng người dùng đăng ký:</span>
              <span className="font-bold text-gray-900 text-sm">
                {stats?.totalUsers || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
