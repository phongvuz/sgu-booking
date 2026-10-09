import Link from "next/link";
import { tripIdSchema } from "@/lib/trip-id";

interface SuccessSearchParams {
  tripId?: string;
  seats?: string;
  pnr?: string;
  name?: string;
  total?: string;
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<SuccessSearchParams>;
}) {
  const params = await searchParams;
  const parsedTripId = tripIdSchema.safeParse(params.tripId && /^\d+$/.test(params.tripId) ? Number(params.tripId) : undefined);
  const tripId = parsedTripId.success ? parsedTripId.data : undefined;
  const pnrCode = params.pnr || `NHAXE-${tripId ?? "BOOKING"}`;

  return (
    <div className="bg-gray-100 min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✅</span>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Đặt vé thành công!</h2>
        <p className="text-gray-600 mb-8">
          Cảm ơn bạn đã tin tưởng và lựa chọn Nhà xe Sài Gòn. Chuyến đi của bạn đã được lưu vào hệ thống cơ sở dữ liệu.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 text-left">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">Thông tin vé</h3>
          <div className="space-y-3 text-gray-700">
            {params.name && (
              <div className="flex justify-between">
                <span>Hành khách:</span>
                <span className="font-bold">{params.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Mã chuyến xe:</span>
              <span className="font-bold text-brand-primary">{tripId ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span>Ghế đã đặt:</span>
              <span className="font-bold text-green-700">{params.seats || "Chưa xác định"}</span>
            </div>
            {params.total && (
              <div className="flex justify-between">
                <span>Tổng tiền:</span>
                <span className="font-bold text-brand-primary">
                  {Number(params.total).toLocaleString("vi-VN")} đ
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span>Mã đặt chỗ (PNR):</span>
              <span className="font-bold text-blue-600">{pnrCode}</span>
            </div>
          </div>
        </div>

  
        <p className="mb-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          Đặt chỗ đang chờ thanh toán. Vui lòng thanh toán tại quầy; nhân viên sẽ xác nhận sau khi thu tiền.
        </p>

        <p className="text-sm text-gray-500 mb-8">
          Vui lòng lưu thông tin vé và xuất trình mã đặt chỗ khi ra bến xe.
        </p>

        <Link 
          href="/" 
          className="inline-block bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-8 rounded-md transition-colors"
        >
          Trở về trang chủ
        </Link>
      </div>
    </div>
  );
}
