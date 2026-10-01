import Link from "next/link";

export default function ClientLayout({children} : {children: React.ReactNode}){
  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen font-sans">
      <header className="bg-white shadow-sm border-b tracking-tight">
        <div className="max-w-7xl mx-auto p-4 flex justify-between items-center ">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🚌</span>
            <span className="font-extrabold text-2xl text-[#1a9e09] ">NHAXESAIGON</span>
          </Link>
          <nav className="space-x-8 font-semibold hidden md:flex">
            <Link href="/" className="hover:text-[#1a9e09] transition-colors"> Trang chủ</Link>
            <Link href="/trips " className="hover:text-[#1a9e09] transition-colors">Lịch trình</Link>
            <Link href="/lookup" className="hover:text-[#1a9e09] transition-colors">Tra cứu vé</Link>
            <Link href="/" className="hover:text-[#1a9e09] transition-colors">Liên hệ</Link>
          </nav>
          <div className="flex items-center gap-4">
             <Link href="/login" className="hover:text-[#1a9e09] transition-colors font-medium">
              Đăng nhập
            </Link>
            <Link href="/register"className="hover:text-[#1a9e09] transition-colors font-medium bg-[#1a9e09] px-5 py-2 rounded-md text-white">
              Đăng ký
            </Link>

          </div>
        </div>
      </header>

      <main>{children}</main>

      
      <footer className="bg-slate-900 text-slate-300 py-12 mt-12">
 <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
              <span>🚌</span> NHAXESAIGON
            </h3>
            <p className="text-sm leading-relaxed mb-4">
              Hệ thống đặt vé xe trực tuyến hàng đầu, mang đến trải nghiệm di chuyển an toàn, tiện lợi và đẳng cấp.
            </p>
            <p className="text-sm font-semibold">Hotline: 1900 1234</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Về chúng tôi</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Giới thiệu</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Tuyển dụng</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Tin tức & Sự kiện</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Hướng dẫn đặt vé</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Quy định hành lý</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Chính sách</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Chính sách bảo mật</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Chính sách hoàn tiền</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-slate-700 text-sm text-center">
          &copy; {new Date().getFullYear()} Nhà xe Sài Gòn. All rights reserved.
        </div>

      </footer>
    </div>
  )
}