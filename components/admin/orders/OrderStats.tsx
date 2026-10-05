"use client";

import React from "react";
import { OrderStats as OrderStatsType } from "@/types";
import { formatPrice } from "@/types/trip";

interface OrderStatsProps {
  stats: OrderStatsType;
}

export function OrderStats({ stats }: OrderStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Tổng số vé
        </p>
        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        <p className="text-[11px] text-gray-400 mt-1">Toàn bộ giao dịch</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
          Đã xác nhận / Thu tiền
        </p>
        <p className="text-2xl font-bold text-emerald-700">{stats.confirmed}</p>
        <p className="text-[11px] text-emerald-600 mt-1">
          {formatPrice(stats.totalRevenue)}
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
          Chờ thanh toán
        </p>
        <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
        <p className="text-[11px] text-amber-600 mt-1">Chờ khách xác nhận</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-1">
          Đã hủy
        </p>
        <p className="text-2xl font-bold text-rose-700">{stats.cancelled}</p>
        <p className="text-[11px] text-rose-600 mt-1">Đã hoàn lại ghế trống</p>
      </div>
    </div>
  );
}
