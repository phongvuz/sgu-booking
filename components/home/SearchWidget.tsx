"use client";

import { useState } from "react";
import type { TripSearchOption } from "@/types";

export default function SearchWidget({ options }: { options: TripSearchOption[] }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  
  const origins = [...new Set(options.map((option) => option.from))];
  const destinations = [...new Set(options.map((option) => option.to))];
  const departureDates = [...new Set(options
    .filter((option) => (!from || option.from === from) && (!to || option.to === to))
    .map((option) => option.date))].sort();
  const canSwap = Boolean(from && to && origins.includes(to) && destinations.includes(from));


  return (
    <div className="relative z-30 w-full max-w-5xl mx-auto px-4 -mt-10 lg:-mt-12">
      <form
        action="/trips"
        method="GET"
        className="bg-white rounded-3xl lg:rounded-full p-3 lg:p-3.5 shadow-2xl shadow-teal-950/10 border border-brand-border flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 transition-all"
      >
        {/* 1. Điểm đi */}
        <div className="flex-1 flex items-center gap-3 px-4 py-2 rounded-2xl lg:rounded-full hover:bg-brand-bg transition-colors border border-transparent hover:border-brand-light">

          <div className="flex-1 min-w-0">
            <label htmlFor="from-select" className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Điểm đi
            </label>
            <div className="relative">
              <select
                id="from-select"
                name="from"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full bg-transparent font-bold text-slate-800 text-sm focus:outline-none cursor-pointer appearance-none pr-5 py-0.5"
              >
                <option value="">Tất cả điểm đi</option>
                {origins.map((origin) => (
                  <option key={origin} value={origin}>{origin}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Divider cho desktop */}
        <div className="hidden lg:block w-px h-10 bg-slate-200" />

        {/* 2. Điểm đến */}
        <div className="flex-1 flex items-center gap-3 px-4 py-2 rounded-2xl lg:rounded-full hover:bg-brand-bg transition-colors border border-transparent hover:border-brand-light">
          <div className="w-9 h-9 rounded-full bg-brand-light text-brand-primary flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <label htmlFor="to-select" className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Điểm đến
            </label>
            <div className="relative">
              <select
                id="to-select"
                name="to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full bg-transparent font-bold text-slate-800 text-sm focus:outline-none cursor-pointer appearance-none pr-5 py-0.5"
              >
                <option value="">Tất cả điểm đến</option>
                {destinations.map((destination) => (
                  <option key={destination} value={destination}>{destination}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Divider cho desktop */}
        <div className="hidden lg:block w-px h-10 bg-slate-200" />

        {/* 3. Ngày đi */}
        <div className="flex-1 flex items-center gap-3 px-4 py-2 rounded-2xl lg:rounded-full hover:bg-brand-bg transition-colors border border-transparent hover:border-brand-light">
          <div className="w-9 h-9 rounded-full bg-brand-light text-brand-primary flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <label htmlFor="date-input" className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Ngày đi
            </label>
            <div className="relative">
              <input
                id="date-input"
                type="date"
                name="date"
                list="departure-dates"
                className="w-full bg-transparent font-bold text-slate-800 text-sm focus:outline-none cursor-pointer py-0.5"
              />
              <datalist id="departure-dates">
                {departureDates.map((date) => <option key={date} value={date} />)}
              </datalist>
            </div>
          </div>
        </div>

        {/* 4. Nút Tìm Chuyến Xe */}
        <button
          type="submit"
          className="bg-brand-primary hover:bg-brand-dark text-white font-semibold px-8 py-3.5 rounded-2xl lg:rounded-full flex items-center justify-center gap-2.5 shadow-lg shadow-teal-900/20 hover:shadow-teal-900/30 transition-all cursor-pointer group shrink-0"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-sm font-bold">Tìm chuyến xe</span>
        </button>
      </form>
      <p className="mt-3 px-4 text-center text-xs text-slate-500">
        {options.length > 0 ? "Để trống ngày đi để xem tất cả lịch chạy." : "Chưa có dữ liệu chuyến xe."}
      </p>
    </div>
  );
}
