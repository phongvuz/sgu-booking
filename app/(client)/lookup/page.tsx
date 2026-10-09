"use client";

import { useState } from "react";
import { getErrorMessage, requestJson } from "@/lib/api-client";
import Link from "next/link";
import { formatTripTime, formatPrice } from "@/lib/trip-display";

interface BookingResult {
  id: number;
  pnr: string;
  seatNumber: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  trip: {
    id: number;
    from: string;
    to: string;
    time: string;
    price: number;
  };
  user: {
    fullName: string;
    phone: string;
  };
}

export default function Lookup() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<BookingResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = keyword.trim();
    if (!q || isLoading) return;

    try {
      setIsLoading(true);
      setSearched(true);
      setError("");
      setResults(null);
      const response = await requestJson<{ success: boolean; data: BookingResult[] }>(`/api/bookings?query=${encodeURIComponent(q)}`);
      if (!Array.isArray(response.data)) throw new Error("Dữ liệu tra cứu không hợp lệ.");
      setResults(response.data);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">TRA CỨU THÔNG TIN VÉ</h2>
        <p className="text-gray-500">
          Nhập số điện thoại hành khách hoặc mã đặt chỗ (PNR) để tra cứu vé từ hệ thống
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Nhập số điện thoại (VD: 0901234567) hoặc mã vé..."
            className="flex-1 border border-gray-300 rounded-xl p-3.5 focus:outline-none focus:border-brand-primary text-gray-700 bg-gray-50"
          />
          <button
            type="submit"
            disabled={isLoading || !keyword.trim()}
            className={`font-bold px-8 py-3.5 rounded-xl transition shadow-sm ${
              isLoading || !keyword.trim()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-brand-primary hover:bg-orange-600 text-white cursor-pointer"
            }`}
          >
            {isLoading ? "Đang tra cứu..." : "Tra cứu"}
          </button>
        </form>
      </div>

      {error && <div role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-red-700">
        <p>{error}</p><button type="button" onClick={() => handleSearch()} className="mt-2 underline">Thử lại</button>
      </div>}
      {searched && !isLoading && !error && (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-700 text-lg">
            Kết quả tra cứu ({results ? results.length : 0} vé tìm thấy):
          </h3>

          {results && results.length > 0 ? (
            results.map((booking) => {
              const { departureTime, dateFormatted } = formatTripTime(
                booking.trip?.time || ""
              );
              const pnrCode = booking.pnr;

              return (
                <div
                  key={booking.id}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-orange-300 transition-colors"
                >
                  <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <span className="font-bold text-brand-primary text-lg">
                      Mã PNR: {pnrCode}
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                        booking.status === "CONFIRMED"
                          ? "bg-green-100 text-green-700"
                          : booking.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {booking.status === "CONFIRMED"
                        ? "Đã xác nhận"
                        : booking.status === "PENDING"
                        ? "Chờ xác nhận"
                        : "Đã hủy"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Họ tên khách hàng</p>
                      <p className="font-bold text-gray-800 text-base">
                        {booking.user?.fullName || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Số điện thoại</p>
                      <p className="font-bold text-gray-800 text-base">
                        {booking.user?.phone || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Tuyến xe</p>
                      <p className="font-bold text-blue-600 text-base">
                        {booking.trip
                          ? `${booking.trip.from} ➔ ${booking.trip.to}`
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Ghế đã đặt</p>
                      <p className="font-extrabold text-brand-primary text-base">
                        {booking.seatNumber}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm gap-2">
                    <span className="text-gray-500">
                      Khởi hành: <strong className="text-gray-800">{departureTime}</strong> ({dateFormatted}) | Mã chuyến: <strong className="text-gray-800">{booking.trip?.id}</strong>
                    </span>
                    <span className="text-xl font-bold text-brand-primary">
                      {formatPrice(booking.totalPrice)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
              <p className="text-gray-500">
                Không tìm thấy thông tin vé nào khớp với từ khóa{" "}
                <span className="font-semibold text-gray-800">&ldquo;{keyword}&rdquo;</span> trong cơ sở dữ liệu.
              </p>
              <Link
                href="/trips"
                className="inline-block mt-4 text-brand-primary font-semibold hover:underline"
              >
                Đặt vé chuyến mới ngay &rarr;
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
