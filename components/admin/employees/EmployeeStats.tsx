"use client";

import React from "react";
import { Employee } from "@/types";

interface EmployeeStatsProps {
  employees: Employee[];
  total: number;
}

export function EmployeeStats({ employees, total }: EmployeeStatsProps) {
  const activeCount = employees.filter((e) => e.status === "Đang làm việc").length;
  const leaveCount = employees.filter((e) => e.status === "Nghỉ phép").length;
  const driverCount = employees.filter((e) => e.role === "Tài xế" || e.role === "Phụ xe").length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase">Tổng nhân sự</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#ef5222] flex items-center justify-center font-bold text-lg">
          👥
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase">Đang làm việc</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">
          🟢
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase">Nghỉ phép</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{leaveCount}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-lg">
          🏖️
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase">Đội xe (Tài & Phụ)</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{driverCount}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-lg">
          🚌
        </div>
      </div>
    </div>
  );
}
