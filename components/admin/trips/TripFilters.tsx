"use client";

import React from "react";

interface TripFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  from: string;
  onFromChange: (value: string) => void;
  to: string;
  onToChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  onReset: () => void;
}

export function TripFilters({
  search,
  onSearchChange,
  from,
  onFromChange,
  to,
  onToChange,
  date,
  onDateChange,
  onReset,
}: TripFiltersProps) {
  const hasFilters = Boolean(search || from || to || date);

  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50/60 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-3 flex-1 flex-wrap">
        {/* Tìm theo ID hoặc hành trình */}
        <div className="relative flex-1 sm:max-w-xs">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo ID chuyến, điểm đi, điểm đến..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-xs placeholder-gray-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
          />
          <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Điểm đi */}
        <input
          type="text"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          placeholder="Điểm đi (VD: Hồ Chí Minh)..."
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
        />

        {/* Điểm đến */}
        <input
          type="text"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          placeholder="Điểm đến (VD: Đà Lạt)..."
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
        />

        {/* Ngày khởi hành */}
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
        />
      </div>

      {hasFilters && (
        <button
          onClick={onReset}
          className="text-xs font-semibold text-rose-600 hover:text-rose-800 px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors self-end md:self-auto flex items-center gap-1 cursor-pointer"
        >
          <span>✕</span>
          <span>Xóa bộ lọc</span>
        </button>
      )}
    </div>
  );
}
