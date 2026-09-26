"use client";

import { useState } from "react";
import Link from "next/link";
import { formatTripTime, formatPrice } from "@/types";

interface TripItem {
  id: number | string;
  code: string;
  from: string;
  to: string;
  time: Date | string;
  price: number;
  availableSeats: number;
}

interface TripListWithFilterProps {
  initialTrips: TripItem[];
}

export default function TripListWithFilter({ initialTrips }: TripListWithFilterProps) {
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);

  const toggleTimeFilter = (slot: string) => {
    setSelectedTimes((prev) =>
      prev.includes(slot) ? prev.filter((item) => item !== slot) : [...prev, slot]
    );
  };

  const toggleVehicleFilter = (type: string) => {
    setSelectedVehicles((prev) =>
      prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSelectedTimes([]);
    setSelectedVehicles([]);
  };

  const filteredTrips = initialTrips.filter((trip) => {
    const tripDate = new Date(trip.time);
    const hours = tripDate.getHours();
    const isLimousine = trip.availableSeats <= 22;

    let matchTime = selectedTimes.length === 0;
    if (!matchTime) {
      if (selectedTimes.includes("early") && hours >= 0 && hours < 6) matchTime = true;
      if (selectedTimes.includes("morning") && hours >= 6 && hours < 12) matchTime = true;
      if (selectedTimes.includes("afternoon") && hours >= 12 && hours < 18) matchTime = true;
      if (selectedTimes.includes("night") && hours >= 18 && hours < 24) matchTime = true;
    }

    let matchVehicle = selectedVehicles.length === 0;
    if (!matchVehicle) {
      if (selectedVehicles.includes("limousine") && isLimousine) matchVehicle = true;
      if (selectedVehicles.includes("sleeper") && !isLimousine) matchVehicle = true;
    }

    return matchTime && matchVehicle;
  });

  const hasActiveFilters = selectedTimes.length > 0 || selectedVehicles.length > 0;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-1/4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="font-bold text-lg text-gray-800">Bộ lọc tìm kiếm</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-500 hover:underline font-medium"
              >
                Xóa lọc
              </button>
            )}
          </div>

          <div className="mb-6">
            <h4 className="font-semibold mb-3 text-sm text-gray-700">Giờ đi</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                <input
                  type="checkbox"
                  checked={selectedTimes.includes("early")}
                  onChange={() => toggleTimeFilter("early")}
                  className="rounded text-[#ef5222] focus:ring-[#ef5222]"
                />
                Sáng sớm (00:00 - 06:00)
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                <input
                  type="checkbox"
                  checked={selectedTimes.includes("morning")}
                  onChange={() => toggleTimeFilter("morning")}
                  className="rounded text-[#ef5222] focus:ring-[#ef5222]"
                />
                Sáng (06:00 - 12:00)
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                <input
                  type="checkbox"
                  checked={selectedTimes.includes("afternoon")}
                  onChange={() => toggleTimeFilter("afternoon")}
                  className="rounded text-[#ef5222] focus:ring-[#ef5222]"
                />
                Chiều (12:00 - 18:00)
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                <input
                  type="checkbox"
                  checked={selectedTimes.includes("night")}
                  onChange={() => toggleTimeFilter("night")}
                  className="rounded text-[#ef5222] focus:ring-[#ef5222]"
                />
                Tối (18:00 - 24:00)
              </label>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold mb-3 text-sm text-gray-700">Loại xe</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                <input
                  type="checkbox"
                  checked={selectedVehicles.includes("sleeper")}
                  onChange={() => toggleVehicleFilter("sleeper")}
                  className="rounded text-[#ef5222] focus:ring-[#ef5222]"
                />
                Giường nằm
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                <input
                  type="checkbox"
                  checked={selectedVehicles.includes("limousine")}
                  onChange={() => toggleVehicleFilter("limousine")}
                  className="rounded text-[#ef5222] focus:ring-[#ef5222]"
                />
                Limousine
              </label>
            </div>
          </div>
        </div>
      </aside>

      {/* Danh sách chuyến xe sau khi lọc */}
      <div className="w-full md:w-3/4 flex flex-col space-y-4">
        {filteredTrips.length > 0 ? (
          filteredTrips.map((trip) => {
            const { departureTime, arrivalTime, dateFormatted } = formatTripTime(trip.time);
            const vehicleType =
              trip.availableSeats <= 22 ? "Limousine 22 phòng" : "Giường nằm 34 chỗ";

            return (
              <div
                key={trip.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between hover:shadow-md transition-shadow"
              >
                {/* Thông tin chuyến */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-center min-w-[70px]">
                      <p className="text-2xl font-bold text-gray-800">{departureTime}</p>
                      <p className="text-sm text-gray-500">{trip.from}</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center relative px-4">
                      <div className="w-full h-[2px] bg-gray-200 absolute"></div>
                      <span className="bg-white px-2 text-xs text-gray-500 relative z-10 border border-gray-200 rounded-full">
                        {trip.code}
                      </span>
                    </div>
                    <div className="text-center min-w-[70px]">
                      <p className="text-2xl font-bold text-gray-800">{arrivalTime}</p>
                      <p className="text-sm text-gray-500">{trip.to}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded font-medium text-gray-800">
                      {vehicleType}
                    </span>
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                      Ngày {dateFormatted}
                    </span>
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                      Còn {trip.availableSeats} chỗ trống
                    </span>
                  </div>
                </div>

                {/* Giá và nút chọn */}
                <div className="mt-6 md:mt-0 md:ml-8 flex flex-col items-start md:items-end justify-center md:border-l md:border-gray-100 md:pl-8">
                  <p className="text-2xl font-extrabold text-[#ef5222] mb-3">
                    {formatPrice(trip.price)}
                  </p>
                  <Link
                    href={`/trips/${trip.code}`}
                    className="bg-[#ef5222] hover:bg-[#d94a1d] text-white font-bold py-2 px-6 rounded-md transition-colors text-center w-full md:w-auto"
                  >
                    Chọn chuyến
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
            <p className="text-gray-500 text-lg">
              {hasActiveFilters
                ? "Không tìm thấy chuyến xe nào phù hợp với bộ lọc đã chọn."
                : "Không tìm thấy chuyến xe nào phù hợp trong cơ sở dữ liệu."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 text-sm text-[#ef5222] font-semibold hover:underline"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
