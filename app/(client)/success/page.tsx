import Link from "next/link";

interface SearchParams {
  tripId: string;
  seats: string;
}

export default async function SuccessPage({searchParams,}: {searchParams: Promise<SearchParams>;}) {
  const params = await searchParams;

  const pnrCode = `NHAXE-${(params.tripId || "VN01")}-8899`;

  return (
    <div className="bg-gray-100 min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✅</span>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Đặt vé thành công!</h2>
        <p className="text-gray-600 mb-8">
          Cảm ơn bạn đã tin tưởng và lựa chọn Nhà xe Sài Gòn. Chuyến đi của bạn đã được xác nhận.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 text-left">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">Thông tin vé</h3>
          <div className="space-y-3 text-gray-700">
            <div className="flex justify-between">
              <span>Mã chuyến xe:</span>
              <span className="font-bold">{params.tripId || "VN01"}</span>
            </div>
            <div className="flex justify-between">
              <span>Ghế đã đặt:</span>
              <span className="font-bold">{params.seats || "Chưa xác định"}</span>
            </div>
            <div className="flex justify-between">
              <span>Mã đặt chỗ (PNR):</span>
              <span className="font-bold text-blue-600">{pnrCode}</span>
            </div>
          </div>
        </div>

  
        {params.total && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 flex flex-col items-center">
            <h3 className="font-bold text-lg mb-4 text-center">Quét mã để thanh toán</h3>
            <img 
              src={`https://img.vietqr.io/image/970436-0987654321-compact2.png?amount=${params.total}&addInfo=Thanh toan ve xe ${pnrCode}&accountName=NHA XE SAI GON`}
              alt="Mã QR Thanh Toán VietQR"
              className="w-64 h-64 object-contain mb-4 border rounded-md p-2 shadow-sm"
            />
            <p className="text-sm text-gray-500 text-center px-4">
              Mở ứng dụng ngân hàng và quét mã QR này để thanh toán. 
              <br/> (Ghi chú: Số tài khoản trong mã QR đang là ví dụ minh họa)
            </p>
          </div>
        )}

        <p className="text-sm text-gray-500 mb-8">
          Chúng tôi đã gửi email xác nhận cùng vé điện tử. Vui lòng xuất trình mã đặt chỗ khi ra bến xe.
        </p>

        <Link 
          href="/" 
          className="inline-block bg-[#ef5222] hover:bg-[#d94a1d] text-white font-bold py-3 px-8 rounded-md transition-colors"
        >
          Trở về trang chủ
        </Link>
      </div>
    </div>
  );
}
