import { prisma } from "@/lib/prisma";
import { resolveLocationName, formatTripTime, formatPrice } from "@/types";
import Link from "next/link";

interface SearchParams {
  from?: string;
  to?: string;
  date?: string;
}

export default async function TripsPage({searchParams,}: {searchParams: Promise<SearchParams>;}) {
  const params = await searchParams;
  const fromQuery = params.from?.trim() || "";
  const toQuery = params.to?.trim() || "";
  const dateQuery = params.date?.trim();
  const fromCity = resolveLocationName(fromQuery);
  const toCity = resolveLocationName(toQuery);

<<<<<<< Updated upstream
  const whereClause: {
    from?: { contains: string };
    to?: { contains: string };
    time?: { gte?: Date; lt?: Date };
  } = {};

  if (fromCity) {
    whereClause.from = { contains: fromCity };
  }
  if (toCity) {
    whereClause.to = { contains: toCity };
  }
  if (dateQuery) {
    const parsedDate = new Date(dateQuery);
    if (!isNaN(parsedDate.getTime())) {
      const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));
      whereClause.time = {
        gte: startOfDay,
        lt: endOfDay,
=======
  let timeFilter = undefined;
  if (params.date) {
    const parsedDate = new Date(params.date);
    if (!isNaN(parsedDate.getTime())) {
      const startOfDay = new Date(parsedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(parsedDate);
      endOfDay.setHours(23, 59, 59, 999);
      timeFilter = {
        gte: startOfDay,
        lte: endOfDay,
>>>>>>> Stashed changes
      };
    }
  }

  let trips = await prisma.trip.findMany({
<<<<<<< Updated upstream
    where: whereClause,
    orderBy: { time: "asc" },
  });

  const hasFilter = Boolean(fromCity || toCity || dateQuery);
  const isFiltered = hasFilter && trips.length > 0;
  if (trips.length === 0 && hasFilter) {
    trips = await prisma.trip.findMany({
=======
    where: {
      from: fromCity ? { contains: fromCity } : undefined,
      to: toCity ? { contains: toCity } : undefined,
      time: timeFilter,
    },
    orderBy: { time: "asc" },
  });

  if (trips.length === 0 && timeFilter && (fromCity || toCity)) {
    trips = await prisma.trip.findMany({
      where: {
        from: fromCity ? { contains: fromCity } : undefined,
        to: toCity ? { contains: toCity } : undefined,
      },
>>>>>>> Stashed changes
      orderBy: { time: "asc" },
    });
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between border border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Kết quả tìm kiếm</h2>
            <p className="text-gray-600">
              Tuyến:{" "}
              <span className="font-bold text-[#ef5222]">
                {fromCity || fromQuery || "Tất cả điểm đi"}
              </span>{" "}
              ➔{" "}
              <span className="font-bold text-[#ef5222]">
                {toCity || toQuery || "Tất cả điểm đến"}
              </span>
              <span className="mx-2">|</span>
              Ngày đi: <span className="font-bold">{params.date || "Hôm nay"}</span>
              <span className="mx-2">|</span>
              Nguồn dữ liệu: <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">MySQL Database</span>
            </p>
          </div>
          <Link href="/" className="mt-4 md:mt-0 text-blue-600 font-medium hover:underline">
            Thay đổi tìm kiếm
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4 border-b pb-2">Bộ lọc tìm kiếm</h3>

              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-sm text-gray-700">Giờ đi</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-[#ef5222] focus:ring-[#ef5222]" /> Sáng sớm (00:00 - 06:00)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-[#ef5222] focus:ring-[#ef5222]" /> Sáng (06:00 - 12:00)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-[#ef5222] focus:ring-[#ef5222]" /> Chiều (12:00 - 18:00)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-[#ef5222] focus:ring-[#ef5222]" /> Tối (18:00 - 24:00)
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-sm text-gray-700">Loại xe</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-[#ef5222] focus:ring-[#ef5222]" /> Giường nằm
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-[#ef5222] focus:ring-[#ef5222]" /> Limousine
                  </label>
                </div>
              </div>
            </div>
          </aside>

          <div className="w-full md:w-3/4 flex flex-col space-y-4">
            {trips.length > 0 ? (
              trips.map((trip) => {
                const { departureTime, arrivalTime, dateFormatted } = formatTripTime(trip.time);
                const vehicleType = trip.availableSeats <= 22 ? "Limousine 22 phòng" : "Giường nằm 34 chỗ";

                return (
                  <div
                    key={trip.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between hover:shadow-md transition-shadow"
                  >
                    {/* Trip Info */}
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

                    {/* Price & Action */}
                    <div className="mt-6 md:mt-0 md:ml-8 flex flex-col items-start md:items-end justify-center md:border-l md:border-gray-100 md:pl-8">
                      <p className="text-2xl font-extrabold text-[#ef5222] mb-3">
                        {formatPrice(trip.price)}
                      </p>
                      <Link
                        href={`/trips/${trip.id}`}
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
                  Không tìm thấy chuyến xe nào phù hợp trong cơ sở dữ liệu.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}