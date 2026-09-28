import Link from "next/link";

interface RouteCardProps {
  title: string;
  distance: string;
  price: string;
  imageUrl: string;
  href: string;
}

export default function RouteCard({
  title,
  distance,
  price,
  imageUrl,
  href,
}: RouteCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="h-48 bg-gray-300 relative">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="font-bold text-xl mb-2">{title}</h3>
        <p className="text-gray-600 mb-4 text-sm">{distance}</p>
        <div className="flex justify-between items-center border-t border-gray-100 pt-4">
          <span className="text-lg font-bold text-[#1a9e09]">{price}</span>
          <Link
            href={href}
            className="text-blue-600 font-medium hover:underline text-sm"
          >
            Xem lịch trình
          </Link>
        </div>
      </div>
    </div>
  );
}
