import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/trip-display";

interface RouteCardProps {
  title: string;
  price: number;
  imageUrl: string;
  href: string;
}

export default function RouteCard({
  title,
  price,
  imageUrl,
  href,
}: RouteCardProps) {
  return (
    <div className="min-w-0 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-brand-light transition-all duration-300 group flex flex-col">
      <div className="h-52 shrink-0 bg-slate-100 relative overflow-hidden">
        <Image
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg text-brand-text mb-1 group-hover:text-brand-primary transition-colors">
            {title}
          </h3>
          <p className="text-slate-500 text-xs mb-4 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Xem giờ khởi hành và ghế trống
          </p>
        </div>
        <div className="flex justify-between items-center border-t border-brand-light pt-3.5 mt-auto">
          <div>
            <span className="text-[11px] text-slate-400 block">Giá vé từ</span>
            <span className="text-base font-extrabold text-brand-primary">{formatPrice(price)}</span>
          </div>
          <Link
            href={href}
            className="px-4 py-2 bg-brand-light hover:bg-brand-primary text-brand-primary hover:text-white rounded-full font-medium text-xs transition-all duration-200"
          >
            Xem lịch trình ›
          </Link>
        </div>
      </div>
    </div>
  );
}
