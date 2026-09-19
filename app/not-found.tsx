import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-orange-100 text-[#ef5222] rounded-full flex items-center justify-center text-5xl mb-6 shadow-sm">
        🚌
      </div>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">404 - Không tìm thấy trang</h1>
      <p className="text-gray-600 max-w-md mb-8">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển. Vui lòng kiểm tra lại đường dẫn.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="bg-[#ef5222] hover:bg-[#d94a1d] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Về Trang Chủ
        </Link>
        <Link
          href="/trips"
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Xem Lịch Trình
        </Link>
      </div>
    </div>
  );
}
