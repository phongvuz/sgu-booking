"use client";

import React from "react";
import { Seat } from "./seatUtils";

interface SeatMapProps {
  seats: Seat[];
  selectedSeats: string[];
  heldSeats: Record<string, string>;
  clientId: string;
  isSubmitting: boolean;
  onToggleSeat: (seatId: string, isBooked: boolean) => void;
}

export default function SeatMap({
  seats,
  selectedSeats,
  heldSeats,
  clientId,
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
                  const holder = heldSeats[seat.id];
                  const isHeldByMe = holder === clientId;
                  const isHeldByOther = holder && holder !== clientId;
                  const isDisabled = seat.isBooked || isHeldByOther || isSubmitting;

                  let seatClass =
                    "bg-white text-gray-700 border-gray-300 hover:border-[#1a9e09] hover:text-[#1a9e09]";

                  if (seat.isBooked) {
                    seatClass =
                      "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed line-through";
                  } else if (isHeldByOther) {
                    seatClass =
                      "bg-orange-200 text-orange-600 border-orange-300 cursor-not-allowed";
                  } else if (selectedSeats.includes(seat.id) || isHeldByMe) {
                    seatClass = "bg-[#1a9e09] text-white border-[#1a9e09] shadow-sm";
                  }

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      onClick={() => onToggleSeat(seat.id, seat.isBooked)}
                      disabled={isDisabled}
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
            <div className="w-4 h-4 bg-[#1a9e09] border border-[#1a9e09] rounded"></div>
            <span className="text-gray-600">Đang chọn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-200 border border-orange-300 rounded"></div>
            <span className="text-gray-600">Đang giữ</span>
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
