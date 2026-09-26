"use client";

import React from "react";

interface EmployeeFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  role: string;
  onRoleChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  onReset: () => void;
}

export function EmployeeFilters({
  search,
  onSearchChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
  onReset,
}: EmployeeFiltersProps) {
  const hasActiveFilters = Boolean(search || role || status);

  return (
    <div className="p-4 border-b border-gray-200 bg-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Search & Select Filters */}
      <div className="flex flex-wrap items-center gap-3 flex-1">
        {/* Search input */}
        <div className="relative min-w-[240px] flex-1 max-w-sm">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên, email, SĐT, mã NV..."
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef5222]/30 focus:border-[#ef5222] transition-colors bg-gray-50/50 hover:bg-white focus:bg-white text-gray-800"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400 hover:text-gray-600 text-xs"
              title="Xóa tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Role select */}
        <select
          value={role}
          onChange={(e) => onRoleChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5222]/30 focus:border-[#ef5222] transition-colors cursor-pointer"
        >
          <option value="">Tất cả vai trò</option>
          <option value="Tài xế">Tài xế</option>
          <option value="Phụ xe">Phụ xe</option>
          <option value="Văn phòng">Văn phòng</option>
          <option value="Quản lý">Quản lý</option>
          <option value="Điều hành">Điều hành</option>
        </select>

        {/* Status select */}
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5222]/30 focus:border-[#ef5222] transition-colors cursor-pointer"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Đang làm việc">🟢 Đang làm việc</option>
          <option value="Nghỉ phép">🟡 Nghỉ phép</option>
          <option value="Đã nghỉ việc">🔴 Đã nghỉ việc</option>
        </select>

        {/* Reset filters button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-gray-500 hover:text-[#ef5222] font-medium flex items-center gap-1 px-2.5 py-2 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer"
          >
            <span>🔄</span> Đặt lại
          </button>
        )}
      </div>
    </div>
  );
}
