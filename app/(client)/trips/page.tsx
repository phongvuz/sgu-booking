import type { TripSearchParams } from "@/types";
import { resolveLocationName } from "@/lib/trip-display";
import Link from "next/link";
import TripListWithFilter from "@/components/trips/TripFilter";
import { getTrips } from "@/services/tripService";


export default async function TripsPage({
  searchParams,
}: {
  searchParams: Promise<TripSearchParams>;
}) {
  const params = await searchParams;
  const fromQuery = params.from?.trim() || "";
  const toQuery = params.to?.trim() || "";

  const fromCity = resolveLocationName(fromQuery);
  const toCity = resolveLocationName(toQuery);

  const trips = await getTrips({
    fromCity,
    toCity,
    date: params.date,
  });

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header tìm kiếm */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between border border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Kết quả tìm kiếm</h2>
            <p className="text-gray-600">
              Tuyến:{" "}
              <span className="font-bold text-brand-primary">
                {fromCity || fromQuery || "Tất cả điểm đi"}
              </span>{" "}
              ➔{" "}
              <span className="font-bold text-brand-primary">
                {toCity || toQuery || "Tất cả điểm đến"}
              </span>
              <span className="mx-2">|</span>
              Ngày đi: <span className="font-bold">{params.date || "Tất cả ngày"}</span>
            </p>
          </div>
          <Link
            href="/"
            className="mt-4 md:mt-0 text-blue-600 font-medium hover:underline flex items-center gap-1"
          >
            <span>&larr;</span> Thay đổi tìm kiếm
          </Link>
        </div>

        <TripListWithFilter initialTrips={trips} />
      </div>
    </div>
  );
}
