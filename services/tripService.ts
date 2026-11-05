import { assertTripId } from "@/lib/trip-id";
import { BusinessError } from "@/lib/business-error";
import { runTransaction } from "@/lib/transaction";
import { getSeatCodes } from "@/lib/seats";
import { formatDepartureDate, getDepartureDayRange, parseVietnamDateTime } from "@/lib/trip-search";
import { positiveInteger } from "@/lib/query-params";
import { assertTripPrice } from "@/lib/money";
import { Prisma } from "@prisma/client";
import { tripTimeSlots, type TripTimeSlot, type TripVehicleFilter } from "@/lib/public-trip-search";
import { prisma } from "@/lib/prisma";
import type { PaginationMeta, TripAdminItem, TripQueryParams, TripStats, TripSearchOption } from "@/types";

interface GetTripsFilter {
  fromCity?: string;
  toCity?: string;
  date?: string; // Định dạng YYYY-MM-DD
  includeBookings?: boolean;
  page?: number;
  limit?: number;
}

interface PublicTripQuery extends Omit<GetTripsFilter, "includeBookings"> {
  times?: TripTimeSlot[];
  vehicles?: TripVehicleFilter[];
}

function bookableTripWhere({ fromCity, toCity, date }: GetTripsFilter, now: Date): Prisma.tripWhereInput {
  const dayRange = date ? getDepartureDayRange(date) : null;
  if (date && !dayRange) throw new BusinessError("Ngày lọc không hợp lệ.");
  return {
    from: fromCity ? { contains: fromCity } : undefined,
    to: toCity ? { contains: toCity } : undefined,
    time: { ...dayRange, gt: now },
    availableSeats: { gt: 0 },
  };
}

function vehicleWhere(vehicles: TripVehicleFilter[]): Prisma.tripWhereInput {
  if (!vehicles.length || vehicles.length === 3) return {};
  const capacities = vehicles.flatMap((vehicle) => vehicle === "limousine" ? [22] : vehicle === "sleeper" ? [34] : []);
  return { OR: [
    ...(capacities.length ? [{ capacity: { in: capacities } }] : []),
    ...(vehicles.includes("other") ? [{ capacity: { notIn: [22, 34] } }] : []),
  ] };
}

interface CreateTripInput {
  from: string;
  to: string;
  time: Date | string;
  price: number;
  capacity: number;
}

interface UpdateTripInput {
  from?: string;
  to?: string;
  time?: Date | string;
  price?: number;
  capacity?: number;
}

/**
 * Lấy danh sách chuyến xe chuẩn cho trang quản trị Admin
 */
export async function queryTripsAdmin(params: TripQueryParams): Promise<{
  data: TripAdminItem[];
  pagination: PaginationMeta;
  stats: TripStats;
}> {
  const {
    bookable = false,
    search = "",
    from = "",
    to = "",
    date = "",
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  const where: Prisma.tripWhereInput = {};

  if (bookable) { where.time = { gt: new Date() }; where.availableSeats = { gt: 0 }; }

  if (search.trim()) {
    const s = search.trim();
    const id = Number(s);
    where.OR = [
      ...(Number.isInteger(id) && id > 0 && id <= 2147483647 ? [{ id }] : []),
      { from: { contains: s } },
      { to: { contains: s } },
    ];
  }

  if (from) {
    where.from = { contains: from };
  }

  if (to) {
    where.to = { contains: to };
  }

  if (date) {
    const range = getDepartureDayRange(date);
    if (!range) throw new BusinessError("Ngày lọc không hợp lệ.");
    where.time = bookable ? { ...range, gt: new Date() } : range;
  }

  const numLimit = positiveInteger(limit, 10, 100);
  const numPage = positiveInteger(page, 1);

  const total = await prisma.trip.count({ where });
  const totalPages = Math.ceil(total / numLimit) || 1;
  const validPage = Math.min(numPage, totalPages);
  const skip = (validPage - 1) * numLimit;

  let orderBy: Prisma.tripOrderByWithRelationInput = {};
  if (sortBy === "createdAt" || sortBy === "price" || sortBy === "availableSeats" || sortBy === "id" || sortBy === "time") {
    orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";
  } else {
    orderBy = { createdAt: "desc" };
  }

  const { gte: startToday, lt: endToday } = getDepartureDayRange(formatDepartureDate(new Date()))!;
  const [trips, capacities, totalActiveBookings, departingToday] = await Promise.all([
    prisma.trip.findMany({
      where,
      orderBy: sortBy === "id" ? orderBy : [orderBy, { id: "desc" }],
      skip,
      take: numLimit,
      include: {
        booking: {
          include: {
            user: {
              select: {
                fullName: true,
                phone: true,
              },
            },
          },
        },
      },
    }),
    prisma.trip.aggregate({ where, _sum: { capacity: true } }),
    prisma.booking.count({ where: { status: { not: "CANCELLED" }, trip: where } }),
    prisma.trip.count({ where: { AND: [where, { time: { gte: startToday, lt: endToday } }] } }),
  ]);

  const totalCapacities = capacities._sum.capacity ?? 0;
  const avgOccupancy = totalCapacities > 0 ? Math.round(totalActiveBookings / totalCapacities * 100) : 0;

  const stats: TripStats = {
    total,
    departingToday,
    totalBookings: totalActiveBookings,
    avgOccupancy,
  };

  const data: TripAdminItem[] = trips.map((t) => {
    const validBookings = t.booking.filter((b) => b.status !== "CANCELLED");
    const bookedCount = validBookings.length;
    const totalSeats = t.capacity;
    const occupancyRate =
      totalSeats > 0 ? Math.round((bookedCount / totalSeats) * 100) : 0;

    return {
      id: t.id,
      from: t.from,
      to: t.to,
      time: t.time.toISOString(),
      price: t.price,
      availableSeats: t.availableSeats,
      totalSeats,
      bookedSeatsCount: bookedCount,
      occupancyRate,
      createdAt: t.createdAt.toISOString(),
      bookings: t.booking.map((b) => ({
        id: b.id,
        seatNumber: b.seatNumber,
        status: b.status,
        totalPrice: b.totalPrice,
        userName: b.passengerName || b.user?.fullName || "Khách vãng lai",
        userPhone: b.passengerPhone || b.user?.phone || "",
      })),
    };
  });

  return {
    data,
    pagination: {
      page: validPage,
      limit: numLimit,
      total,
      totalPages,
    },
    stats,
  };
}

export async function getTrips({
  fromCity,
  toCity,
  date,
  includeBookings = false,
  page = 1,
  limit = 20,
}: GetTripsFilter) {
  const take = positiveInteger(limit, 20, 100);

  return await prisma.trip.findMany({
    where: bookableTripWhere({ fromCity, toCity, date }, new Date()),
    orderBy: [{ time: "asc" }, { id: "asc" }],
    take,
    skip: (positiveInteger(page, 1, Math.floor(2147483647 / take) + 1) - 1) * take,
    include: includeBookings
      ? {
          booking: {
            select: {
              id: true,
              seatNumber: true,
              status: true,
            },
          },
        }
      : undefined,
  });
}

export async function queryPublicTrips({
  fromCity, toCity, date, page = 1, limit = 10, times = [], vehicles = [],
}: PublicTripQuery) {
  times = [...new Set(times)].filter((time) => Object.hasOwn(tripTimeSlots, time));
  vehicles = [...new Set(vehicles)].filter((vehicle) => ["limousine", "sleeper", "other"].includes(vehicle));
  const now = new Date();
  const where = { ...bookableTripWhere({ fromCity, toCity, date }, now), ...vehicleWhere(vehicles) };
  const take = positiveInteger(limit, 10, 100);

  // MySQL stores Prisma DateTimes in UTC. Use the same Vietnam hours as the UI,
  // and filter before LIMIT so the total and every page share the same filters.
  const conditions = [Prisma.sql`time > ${now}`, Prisma.sql`availableSeats > 0`];
  if (fromCity) conditions.push(Prisma.sql`\`from\` LIKE ${`%${fromCity}%`}`);
  if (toCity) conditions.push(Prisma.sql`\`to\` LIKE ${`%${toCity}%`}`);
  const dayRange = date ? getDepartureDayRange(date) : null;
  if (dayRange) conditions.push(Prisma.sql`time >= ${dayRange.gte} AND time < ${dayRange.lt}`);
  if (vehicles.length && vehicles.length < 3) {
    const vehicleConditions = vehicles.map((vehicle) => vehicle === "limousine"
      ? Prisma.sql`capacity = ${22}`
      : vehicle === "sleeper" ? Prisma.sql`capacity = ${34}` : Prisma.sql`capacity NOT IN (${22}, ${34})`);
    conditions.push(Prisma.sql`(${Prisma.join(vehicleConditions, " OR ")})`);
  }
  if (times.length) conditions.push(Prisma.sql`(${Prisma.join(times.map((time) => {
    const slot = tripTimeSlots[time];
    return Prisma.sql`(HOUR(DATE_ADD(time, INTERVAL 7 HOUR)) >= ${slot.start} AND HOUR(DATE_ADD(time, INTERVAL 7 HOUR)) < ${slot.end})`;
  }), " OR ")})`);
  const predicate = Prisma.join(conditions, " AND ");
  const total = times.length
    ? Number((await prisma.$queryRaw<Array<{ total: bigint }>>(Prisma.sql`SELECT COUNT(*) AS total FROM trip WHERE ${predicate}`))[0].total)
    : await prisma.trip.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / take));
  const validPage = Math.min(positiveInteger(page, 1, Math.floor(2147483647 / take) + 1), totalPages);
  const skip = (validPage - 1) * take;
  const ids = times.length
    ? await prisma.$queryRaw<Array<{ id: number }>>(Prisma.sql`SELECT id FROM trip WHERE ${predicate} ORDER BY time ASC, id ASC LIMIT ${take} OFFSET ${skip}`)
    : null;
  const data = await prisma.trip.findMany({
    where: ids ? { AND: [where, { id: { in: ids.map(({ id }) => id) } }] } : where,
    orderBy: [{ time: "asc" }, { id: "asc" }],
    ...(ids ? {} : { skip, take }),
  });
  return { data, pagination: { page: validPage, limit: take, total, totalPages } };
}

/**
 * Lấy chi tiết chuyến xe theo ID số.
 */
export async function getTripById(tripId: number, includeBookings = false) {
  const id = assertTripId(tripId);
  return await prisma.trip.findUnique({
    where: { id },
    include: includeBookings
      ? {
          booking: {
            where: { status: { not: "CANCELLED" } },
            select: {
              id: true,
              seatNumber: true,
              status: true,
            },
          },
        }
      : undefined,
  });
}

export async function getBookedSeats(tripId: number): Promise<string[]> {
  assertTripId(tripId);
  const bookings = await prisma.booking.findMany({
    where: {
      tripId,
      status: { not: "CANCELLED" },
    },
    select: {
      seatNumber: true,
    },
  });

  return bookings.map((b) => b.seatNumber.trim());
}

export async function createTrip(data: CreateTripInput) {
  assertTripPrice(data.price);
  const time = parseVietnamDateTime(data.time);
  if (!Number.isFinite(time.getTime()) || time <= new Date()) throw new BusinessError("Chọn thời gian xuất bến trong tương lai.");
  return prisma.trip.create({ data: {
    from: data.from.trim(), to: data.to.trim(), time, price: data.price,
    capacity: data.capacity, availableSeats: data.capacity,
  } });
}

export async function updateTrip(tripId: number, data: UpdateTripInput) {
  const id = assertTripId(tripId);
  if (data.price !== undefined) assertTripPrice(data.price);
  return runTransaction(async (tx) => {
    const trip = await tx.trip.findUnique({ where: { id }, include: { booking: { where: { status: { not: "CANCELLED" } } } } });
    if (!trip) return null;
    const time = data.time ? parseVietnamDateTime(data.time) : trip.time;
    if (!Number.isFinite(time.getTime())) throw new BusinessError("Thời gian xuất bến không hợp lệ.");
    if (time.getTime() !== trip.time.getTime() && time <= new Date()) throw new BusinessError("Chọn thời gian xuất bến trong tương lai.");
    const from = data.from ?? trip.from;
    const to = data.to ?? trip.to;
    if (trip.booking.length && (from !== trip.from || to !== trip.to || time.getTime() !== trip.time.getTime())) {
      throw new BusinessError("Chuyến có vé đang hiệu lực. Không thể đổi hành trình hoặc giờ xuất bến.", 409);
    }
    const capacity = data.capacity ?? trip.capacity;
    const validSeats = getSeatCodes(capacity);
    if (trip.booking.some((booking) => !validSeats.includes(booking.seatNumber))) {
      throw new BusinessError("Sức chứa mới loại bỏ ghế đã bán. Vui lòng chọn sức chứa lớn hơn.", 409);
    }
    // Số ghế trống được tính từ sức chứa và vé hiệu lực, admin không sửa trực tiếp.
    if (await tx.seatHold.count({ where: { tripId: trip.id, seatNumber: { notIn: validSeats }, expiresAt: { gt: new Date() } } })) {
      throw new BusinessError("Có ghế đang được giữ nằm ngoài sức chứa mới. Vui lòng chờ hết thời gian giữ ghế.", 409);
    }
    await tx.seatHold.deleteMany({ where: { tripId: trip.id, seatNumber: { notIn: validSeats } } });
    return tx.trip.update({ where: { id: trip.id }, data: { from, to, time, price: data.price, capacity, availableSeats: capacity - trip.booking.length } });
  });
}

export async function deleteTrip(tripId: number) {
  const id = assertTripId(tripId);
  return runTransaction(async (tx) => {
    const trip = await tx.trip.findUnique({ where: { id } });
    if (!trip) return null;
    if (await tx.booking.count({ where: { tripId: trip.id } })) throw new BusinessError("Chuyến có lịch sử vé, không thể xóa.", 409);
    return tx.trip.delete({ where: { id: trip.id } });
  });
}

export async function getTripSearchOptions(): Promise<TripSearchOption[]> {
  const trips = await prisma.trip.findMany({
    where: { time: { gt: new Date() }, availableSeats: { gt: 0 } },
    select: { from: true, to: true, time: true },
    distinct: ["from", "to", "time"],
    orderBy: { time: "asc" },
  });
  return trips.map((trip) => ({
    from: trip.from,
    to: trip.to,
    date: formatDepartureDate(trip.time),
  }));
}

export function getFeaturedRoutes() {
  return prisma.trip.groupBy({
    by: ["from", "to"],
    where: { time: { gte: new Date() }, availableSeats: { gt: 0 } },
    _min: { price: true },
    orderBy: { _min: { price: "asc" } },
    take: 3,
  });
}
