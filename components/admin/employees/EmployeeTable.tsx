"use client";

import { FiEdit, FiEye, FiTrash2, FiUsers } from "react-icons/fi";
import { FaCircle } from "react-icons/fa";
import Image from "next/image";

import React from "react";
import { Employee } from "@/types";

interface EmployeeTableProps {
  employees: Employee[];
  loading: boolean;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onView: (employee: Employee) => void;
}

export function EmployeeTable({
  employees,
  loading,
  onEdit,
  onDelete,
  onView,
}: EmployeeTableProps) {
  // Skeleton loader when data is fetching
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3.5 font-semibold">Nhân viên</th>
              <th className="px-6 py-3.5 font-semibold">Liên hệ</th>
              <th className="px-6 py-3.5 font-semibold">Vai trò / Phòng ban</th>
              <th className="px-6 py-3.5 font-semibold">Trạng thái</th>
              <th className="px-6 py-3.5 font-semibold">Ngày vào làm</th>
              <th className="px-6 py-3.5 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-4 bg-gray-200 rounded w-28" />
                      <div className="h-3 bg-gray-100 rounded w-16" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1.5">
                    <div className="h-3.5 bg-gray-200 rounded w-36" />
                    <div className="h-3 bg-gray-100 rounded w-24" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1.5">
                    <div className="h-4 bg-gray-200 rounded w-20" />
                    <div className="h-3 bg-gray-100 rounded w-16" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 bg-gray-200 rounded-full w-24" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-3.5 bg-gray-200 rounded w-24" />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="h-7 bg-gray-200 rounded w-28 ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Empty state when no employees match
  if (employees.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="w-16 h-16 bg-orange-50 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
          <FiUsers aria-hidden="true" className="inline-block shrink-0 align-middle" />
        </div>
        <h4 className="text-base font-semibold text-gray-800 mb-1">
          Không tìm thấy nhân viên nào
        </h4>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Không có kết quả nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại. Vui lòng thử lại với từ khóa khác.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50/80 text-gray-600 border-b border-gray-200 uppercase text-[11px] tracking-wider font-semibold">
          <tr>
            <th className="px-6 py-3.5">Nhân viên</th>
            <th className="px-6 py-3.5">Liên hệ</th>
            <th className="px-6 py-3.5">Vai trò & Phòng ban</th>
            <th className="px-6 py-3.5">Trạng thái</th>
            <th className="px-6 py-3.5">Ngày vào làm</th>
            <th className="px-6 py-3.5 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {employees.map((emp) => {
            const isWorking = emp.status === "Đang làm việc";
            const isOnLeave = emp.status === "Nghỉ phép";

            return (
              <tr
                key={emp.id}
                className="hover:bg-orange-50/30 transition-colors group"
              >
                {/* Avatar & Name & ID */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Image
                      width={40}
                      height={40}
                      unoptimized
                      src={
                        emp.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          emp.name
                        )}&background=ef5222&color=fff&size=100`
                      }
                      alt={emp.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0 bg-gray-100"
                    />
                    <div>
                      <div
                        onClick={() => onView(emp)}
                        className="font-bold text-gray-900 hover:text-brand-primary transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <span>{emp.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] font-mono font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {emp.id}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Contact (Phone & Email) */}
                <td className="px-6 py-4">
                  <div className="text-gray-900 font-medium">{emp.phone}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[200px]" title={emp.email}>
                    {emp.email}
                  </div>
                </td>

                {/* Role & Department */}
                <td className="px-6 py-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800">
                    {emp.role}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{emp.department}</div>
                </td>

                {/* Status Badge */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      isWorking
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                        : isOnLeave
                        ? "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
                        : "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20"
                    }`}
                  >
                    <FaCircle
                      aria-hidden="true"
                      className={`w-1.5 h-1.5 shrink-0 ${
                        isWorking
                          ? "text-emerald-500"
                          : isOnLeave
                          ? "text-amber-500"
                          : "text-rose-500"
                      }`}
                    />
                    {emp.status}
                  </span>
                </td>

                {/* Start Date */}
                <td className="px-6 py-4 text-xs text-gray-600">
                  {emp.startDate || "Chưa rõ"}
                </td>

                {/* Action Buttons */}
                <td className="px-6 py-4 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    {/* View Details */}
                    <button
                      aria-label="Xem hồ sơ chi tiết"
                      type="button"
                      onClick={() => onView(emp)}
                      className="p-1.5 text-gray-500 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      title="Xem hồ sơ chi tiết"
                    >
                      <FiEye aria-hidden="true" className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      aria-label="Chỉnh sửa nhân viên"
                      type="button"
                      onClick={() => onEdit(emp)}
                      className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Chỉnh sửa nhân viên"
                    >
                      <FiEdit aria-hidden="true" className="w-4 h-4" />
                    </button>

                    {/* Toggle status / Deactivate / Delete */}
                    <button
                      aria-label="Xóa hoặc đổi trạng thái nghỉ việc"
                      type="button"
                      onClick={() => onDelete(emp)}
                      className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa hoặc đổi trạng thái nghỉ việc"
                    >
                      <FiTrash2 aria-hidden="true" className="w-4 h-4" />
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
