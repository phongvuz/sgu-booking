"use client";

import React from "react";
import type { Seat } from "@/types/trip";

interface SeatMapProps {
  seats: Seat[];
  selectedSeats: string[];
  isSubmitting: boolean;
  onToggleSeat: (seatId: string, isBooked: boolean) => void;
}

export default function SeatMap({
  seats,
  selectedSeats,
  isSubmitting,
  onToggleSeat,
}: SeatMapProps) {
  const renderFloor = (floorNum: 1 | 2) => {
    const floorSeats = seats.filter((s) => s.floor === floorNum);

    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg">
        <h4 className="text-center font-bold text-gray-700 mb-4 pb-2 border-b">
          Tầng {floorNum === 1 ? "1 (Dưới)" : "2 (Trên)"}
        </h4>
        <div className="grid grid-cols-3 gap-x-4 gap-y-3">
          {["A", "B", "C"].map((row) => (
            <div key={row} className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-center text-gray-400">
                Dãy {row}
              </span>
              {floorSeats
                .filter((s) => s.row === row)
                .map((seat) => {
                  let seatClass =
                    "bg-white text-gray-700 border-gray-300 hover:border-brand-primary hover:text-brand-primary";

                  if (seat.isBooked) {
                    seatClass =
                      "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed line-through";
                  } else if (selectedSeats.includes(seat.id)) {
                    seatClass = "bg-brand-primary text-white border-brand-primary shadow-sm";
                  }

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      onClick={() => onToggleSeat(seat.id, seat.isBooked)}
                      disabled={seat.isBooked || isSubmitting}
                      className={`w-full py-3 rounded text-sm font-bold border transition-colors ${seatClass}`}
                    >
                      {seat.id}
                    </button>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg shadow-sm">
      {/* Chú thích màu sắc */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">Chọn ghế ngồi</h3>
        <div className="flex gap-4 text-sm font-medium">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
            <span className="text-gray-600">Trống</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-brand-primary border border-brand-primary rounded"></div>
            <span className="text-gray-600">Đang chọn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
            <span className="text-gray-400">Đã đặt</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {renderFloor(1)}
        {renderFloor(2)}
      </div>
    </div>
  );
}
