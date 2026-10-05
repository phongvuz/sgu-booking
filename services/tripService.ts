import { prisma } from "@/lib/prisma";
import { PaginationMeta } from "@/types";

export interface GetTripsFilter {
  fromCity?: string;
  toCity?: string;
  date?: string; // Định dạng YYYY-MM-DD
  includeBookings?: boolean;
}

export interface CreateTripInput {
  from: string;
  to: string;
  time: Date | string;
  price: number;
  availableSeats?: number;
  code?: string;
}

export interface UpdateTripInput {
  from?: string;
  to?: string;
  time?: Date | string;
  price?: number;
  availableSeats?: number;
}

export interface TripQueryParams {
  search?: string;
  from?: string;
  to?: string;
  date?: string;
  page?: number;
  limit?: number;
  sortBy?: "time" | "price" | "availableSeats" | "code" | "id";
  sortOrder?: "asc" | "desc";
}

export interface TripAdminItem {
  id: number;
  code: string;
  from: string;
  to: string;
  time: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  bookedSeatsCount: number;
  occupancyRate: number;
  createdAt: string;
  bookings: Array<{
    id: number;
    seatNumber: string;
    status: string;
    totalPrice: number;
    userName: string;
    userPhone: string;
  }>;
}

export interface TripStats {
  total: number;
  departingToday: number;
  totalBookings: number;
  avgOccupancy: number;
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
    search = "",
    from = "",
    to = "",
    date = "",
    page = 1,
    limit = 8,
    sortBy = "time",
    sortOrder = "asc",
  } = params;

  const where: any = {};

  if (search.trim()) {
    const s = search.trim();
    where.OR = [
      { code: { contains: s } },
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
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      const startOfDay = new Date(parsedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(parsedDate);
      endOfDay.setHours(23, 59, 59, 999);
      where.time = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }
  }

  const numLimit = Math.max(1, Number(limit) || 8);
  const numPage = Math.max(1, Number(page) || 1);

  const total = await prisma.trip.count({ where });
  const totalPages = Math.ceil(total / numLimit) || 1;
  const validPage = Math.min(numPage, totalPages);
  const skip = (validPage - 1) * numLimit;

  let orderBy: any = {};
  if (sortBy === "price" || sortBy === "availableSeats" || sortBy === "code" || sortBy === "time") {
    orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";
  } else {
    orderBy = { time: "asc" };
  }

  const [trips, allTripsWithBookings] = await Promise.all([
    prisma.trip.findMany({
      where,
      orderBy,
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
    prisma.trip.findMany({
      select: {
        id: true,
        time: true,
        availableSeats: true,
        booking: {
          where: { status: { not: "CANCELLED" } },
          select: { id: true },
        },
      },
    }),
  ]);

  // Tính toán thống kê
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endToday = new Date(today);
  endToday.setHours(23, 59, 59, 999);

  const departingToday = allTripsWithBookings.filter((t) => {
    const d = new Date(t.time);
    return d >= today && d <= endToday;
  }).length;

  let totalActiveBookings = 0;
  let totalCapacities = 0;
  allTripsWithBookings.forEach((t) => {
    const booked = t.booking.length;
    totalActiveBookings += booked;
    totalCapacities += t.availableSeats + booked;
  });

  const avgOccupancy =
    totalCapacities > 0
      ? Math.round((totalActiveBookings / totalCapacities) * 100)
      : 0;

  const stats: TripStats = {
    total: allTripsWithBookings.length,
    departingToday,
    totalBookings: totalActiveBookings,
    avgOccupancy,
  };

  const data: TripAdminItem[] = trips.map((t) => {
    const validBookings = t.booking.filter((b) => b.status !== "CANCELLED");
    const bookedCount = validBookings.length;
    const totalSeats = t.availableSeats + bookedCount;
    const occupancyRate =
      totalSeats > 0 ? Math.round((bookedCount / totalSeats) * 100) : 0;

    return {
      id: t.id,
      code: t.code,
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
        userName: b.user?.fullName || "Khách vãng lai",
        userPhone: b.user?.phone || "",
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
}: GetTripsFilter) {
  let timeFilter = undefined;
  if (date) {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      const startOfDay = new Date(parsedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(parsedDate);
      endOfDay.setHours(23, 59, 59, 999);
      timeFilter = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }
  }

  return await prisma.trip.findMany({
    where: {
      from: fromCity ? { contains: fromCity } : undefined,
      to: toCity ? { contains: toCity } : undefined,
      ...(timeFilter ? { time: timeFilter } : {}),
    },
    orderBy: { time: "asc" },
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

/**
 * Lấy chi tiết chuyến xe theo ID (số) hoặc mã code chuyến xe (VD: SG-DL-01)
 */
export async function getTripByIdOrCode(idOrCode: string | number, includeBookings = false) {
  const numId = Number(idOrCode);
  return await prisma.trip.findFirst({
    where: {
      OR: [
        ...(!isNaN(numId) ? [{ id: numId }] : []),
        { code: String(idOrCode) },
      ],
    },
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

/**
 * Lấy danh sách các mã ghế đã đặt của một chuyến xe từ database (loại trừ vé đã hủy)
 */
export async function getBookedSeats(tripId: string | number): Promise<string[]> {
  const numId = Number(tripId);
  const bookings = await prisma.booking.findMany({
    where: {
      trip: {
        OR: [
          ...(!isNaN(numId) ? [{ id: numId }] : []),
          { code: String(tripId) },
        ],
      },
      status: { not: "CANCELLED" },
    },
    select: {
      seatNumber: true,
    },
  });

  return bookings.map((b) => b.seatNumber.trim());
}

/**
 * Tạo tuyến xe mới vào cơ sở dữ liệu
 */
export async function createTrip(data: CreateTripInput) {
  let tripCode = data.code?.trim().toUpperCase();
  if (!tripCode) {
    const count = await prisma.trip.count();
    tripCode = `VN${String(count + 1).padStart(2, "0")}`;
  }

  const existing = await prisma.trip.findUnique({
    where: { code: tripCode },
  });

  if (existing) {
    throw new Error(`Mã chuyến xe ${tripCode} đã tồn tại trong database.`);
  }

  return await prisma.trip.create({
    data: {
      code: tripCode,
      from: data.from.trim(),
      to: data.to.trim(),
      time: new Date(data.time),
      price: data.price,
      availableSeats: data.availableSeats ?? 30,
    },
  });
}

/**
 * Cập nhật thông tin tuyến xe
 */
export async function updateTrip(idOrCode: string | number, data: UpdateTripInput) {
  const trip = await getTripByIdOrCode(idOrCode);
  if (!trip) {
    return null;
  }

  return await prisma.trip.update({
    where: { id: trip.id },
    data: {
      from: data.from !== undefined ? data.from.trim() : undefined,
      to: data.to !== undefined ? data.to.trim() : undefined,
      time: data.time ? new Date(data.time) : undefined,
      price: data.price !== undefined ? Number(data.price) : undefined,
      availableSeats: data.availableSeats !== undefined ? Number(data.availableSeats) : undefined,
    },
  });
}

/**
 * Xóa một tuyến xe khỏi cơ sở dữ liệu
 */
export async function deleteTrip(idOrCode: string | number) {
  const trip = await getTripByIdOrCode(idOrCode);
  if (!trip) {
    return null;
  }

  return await prisma.trip.delete({
    where: { id: trip.id },
  });
}
