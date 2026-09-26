import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatTripTime, formatPrice } from "@/types";
import SeatSelector from "@/components/SeatSelector";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TripDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const tripId = resolvedParams.id;

  const tripInfo = await prisma.trip.findUnique({
    where: {
      code: tripId,
    },
    include: {
      bookings: true,
    },
  });

  if (!tripInfo) {
    notFound();
  }

  const { departureTime, dateFormatted } = formatTripTime(tripInfo.time);
  const formattedPrice = formatPrice(tripInfo.price);
  const bookedSeats = tripInfo.bookings.map((b) => b.seatNumber);

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Link & Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between">
          <Link
            href="/trips"
            className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium mb-4 md:mb-0"
          >
            <span>&larr;</span> Quay lại danh sách
          </Link>
          <h2 className="text-2xl font-bold text-gray-800">
            Chi tiết chuyến xe: <span className="text-[#ef5222]">{tripInfo.code}</span>
          </h2>
        </div>

        {/* Thông tin hành trình */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm rounded-lg mb-8">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-5">
            <h3 className="text-lg font-bold text-gray-800">
              Thông tin hành trình (MySQL Database)
            </h3>
            <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-semibold">
              Còn {tripInfo.availableSeats} ghế trống
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-gray-500 text-sm mb-1">Tuyến xe</p>
              <p className="font-bold text-gray-900">
                {tripInfo.from} ➔ {tripInfo.to}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Giờ xuất bến</p>
              <p className="font-bold text-gray-900">{departureTime}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Ngày đi</p>
              <p className="font-bold text-gray-900">{dateFormatted}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Giá vé</p>
              <p className="font-extrabold text-xl text-[#ef5222]">{formattedPrice}</p>
            </div>
          </div>
        </div>

<<<<<<< Updated upstream
        {/* Component Sơ đồ ghế và Thanh toán */}
        <SeatSelector tripId={String(tripInfo.id)} pricePerSeatStr={tripInfo.price} />
=======
        <SeatSelector
          tripId={String(tripInfo.id)}
          tripCode={tripInfo.code}
          pricePerSeatStr={tripInfo.price}
          bookedSeats={bookedSeats}
        />
>>>>>>> Stashed changes
      </div>
    </div>
  );
}
