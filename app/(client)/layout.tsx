import Link from "next/link";
import { Suspense } from "react";
import CustomerMenu from "@/components/auth/CustomerMenu";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-brand-bg text-brand-text flex flex-col min-h-screen font-sans selection:bg-brand-primary selection:text-white">
      {/* Top Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-brand-light sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-dark text-white flex items-center justify-center shadow-md shadow-teal-900/10 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-black text-2xl tracking-wider text-brand-primary leading-none">
                  NOMAD
                </span>
                <span className="text-[11px] font-medium tracking-tight text-slate-500 mt-1">
                  Cùng bạn đi xa hơn
                </span>
              </div>
            </Link>

            {/* Quick search bar (center) */}
            <div className="hidden lg:flex items-center flex-1 max-w-xs mx-6">
              <form action="/trips" className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="to"
                  placeholder="Bạn muốn đi đâu?"
                  className="w-full pl-10 pr-4 py-2 bg-brand-bg border border-[#DEECE5] rounded-full text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                />
              </form>
            </div>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center space-x-7 text-sm font-medium text-slate-700">
              <Link href="/" className="hover:text-brand-primary transition-colors">
                Trang chủ
              </Link>
              <Link href="/trips" className="hover:text-brand-primary transition-colors">
                Lịch trình
              </Link>
              <Link href="/#destinations" className="hover:text-brand-primary transition-colors">
                Điểm đến
              </Link>
              <Link href="/#guides" className="hover:text-brand-primary transition-colors">
                Cẩm nang
              </Link>
              <Link href="/lookup" className="hover:text-brand-primary transition-colors">
                Tra cứu vé
              </Link>
            </nav>

            {/* Auth / Profile Area */}
            <div className="flex items-center gap-3">
              <Suspense fallback={<span className="text-xs text-slate-400">Đang tải...</span>}>
                <CustomerMenu />
              </Suspense>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
\
      <footer className="relative bg-brand-dark text-slate-200 mt-20 pt-16 pb-12 overflow-hidden">
        {/* Organic Wave Top Divider */}
        <div className="absolute top-0 left-0 right-0 overflow-hidden leading-none pointer-events-none -translate-y-[99%]">
          <svg
            className="relative block w-full h-10 md:h-14 text-brand-dark"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            fill="currentColor"
          >
            <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,50 L1200,120 L0,120 Z" />
          </svg>
        </div>

        {/* Ambient background glow and leaf silhouettes */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,94,87,0.4),transparent_50%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 pb-12 border-b border-emerald-900/60">
            {/* Brand column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif font-black text-2xl tracking-wider text-white leading-none">
                    NOMAD
                  </h3>
                  <p className="text-xs text-emerald-200/80 mt-1">Cùng bạn đi xa hơn</p>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
                Nền tảng du lịch và đặt vé xe chất lượng cao. Khám phá vẻ đẹp bất tận trên mọi hành trình khắp Việt Nam.
              </p>

              {/* Social icons */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="YouTube"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 1: Điểm đến */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold text-sm tracking-wide">Điểm đến</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><Link href="/trips?to=HAN" className="hover:text-white transition-colors">Miền Bắc</Link></li>
                <li><Link href="/trips?to=DAD" className="hover:text-white transition-colors">Miền Trung</Link></li>
                <li><Link href="/trips?to=SGN" className="hover:text-white transition-colors">Miền Nam</Link></li>
                <li><Link href="/trips?to=DLT" className="hover:text-white transition-colors">Đà Lạt</Link></li>
                <li><Link href="/trips?to=NHA" className="hover:text-white transition-colors">Nha Trang</Link></li>
              </ul>
            </div>

            {/* Column 2: Trải nghiệm */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold text-sm tracking-wide">Trải nghiệm</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><Link href="/trips" className="hover:text-white transition-colors">Tour du lịch</Link></li>
                <li><Link href="/trips" className="hover:text-white transition-colors">Hoạt động bản địa</Link></li>
                <li><Link href="/trips" className="hover:text-white transition-colors">Ẩm thực vùng miền</Link></li>
                <li><Link href="/trips" className="hover:text-white transition-colors">Vé xe Limousine</Link></li>
              </ul>
            </div>

            {/* Column 3: Cẩm nang */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold text-sm tracking-wide">Cẩm nang</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><Link href="/#guides" className="hover:text-white transition-colors">Kinh nghiệm du lịch</Link></li>
                <li><Link href="/#guides" className="hover:text-white transition-colors">Gợi ý lịch trình</Link></li>
                <li><Link href="/#guides" className="hover:text-white transition-colors">Checklist chuẩn bị</Link></li>
                <li><Link href="/#guides" className="hover:text-white transition-colors">Mẹo tiết kiệm</Link></li>
              </ul>
            </div>

            {/* Column 4: Hỗ trợ */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold text-sm tracking-wide">Hỗ trợ</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><Link href="/lookup" className="hover:text-white transition-colors">Tra cứu đơn vé</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Liên hệ 24/7</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Câu hỏi thường gặp</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Chính sách bảo mật</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom copyright */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-200/70">
            <p>© {new Date().getFullYear()} NOMAD • Nhà xe Sài Gòn. Cùng bạn đi xa hơn.</p>
            <p>Hotline hỗ trợ: <span className="font-semibold text-white">1900 1234</span> (24/7)</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
