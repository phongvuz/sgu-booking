import { prisma } from "@/lib/prisma";

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
  let tripCode = data.code?.trim();
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
