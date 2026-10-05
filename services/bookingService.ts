import { prisma } from "@/lib/prisma";
import { OrderItem, OrderQueryParams, PaginationMeta, OrderStats, BookingStatus } from "@/types";

export interface CreateBookingInput {
  tripId: string | number;
  seats: string[];
  fullName: string;
  phone: string;
  status?: BookingStatus;
}

export interface BookingResult {
  pnr: string;
  tripCode: string;
  tripId: number;
  passenger: {
    name: string;
    phone: string;
  };
  seats: string[];
  totalPrice: number;
  bookingIds: number[];
}

export class BookingConflictError extends Error {
  conflictingSeats: string[];
  constructor(conflictingSeats: string[]) {
    super(
      `Ghế ${conflictingSeats.join(", ")} đã được người khác đặt trước đó. Vui lòng chọn ghế khác.`
    );
    this.name = "BookingConflictError";
    this.conflictingSeats = conflictingSeats;
  }
}

export class TripNotFoundError extends Error {
  constructor(tripId: string | number) {
    super(`Không tìm thấy chuyến xe với ID: ${tripId}`);
  }
}

/**
 * Đặt vé xe mới (cả online và offline)
 */
export async function createBooking({
  tripId,
  seats,
  fullName,
  phone,
  status = "CONFIRMED",
}: CreateBookingInput): Promise<BookingResult> {
  const numTripId = Number(tripId);

  const trip = await prisma.trip.findFirst({
    where: {
      OR: [
        ...(!isNaN(numTripId) ? [{ id: numTripId }] : []),
        { code: String(tripId) },
      ],
    },
  });

  if (!trip) {
    throw new TripNotFoundError(tripId);
  }

  // Lấy danh sách ghế đang chiếm giữ
  const existingBookings = await prisma.booking.findMany({
    where: {
      tripId: trip.id,
      status: { not: "CANCELLED" },
    },
    select: {
      seatNumber: true,
    },
  });

  const alreadyBookedList = existingBookings.map((b) =>
    b.seatNumber.toUpperCase().trim()
  );

  const conflictingSeats = seats.filter((seat: string) => {
    const s = seat.toUpperCase().trim();
    return alreadyBookedList.includes(s);
  });

  if (conflictingSeats.length > 0) {
    throw new BookingConflictError(conflictingSeats);
  }

  const trimmedPhone = phone.trim();
  const trimmedName = fullName.trim();

  let user = await prisma.user.findFirst({
    where: { phone: trimmedPhone },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        fullName: trimmedName,
        phone: trimmedPhone,
        password: "guest_password",
        role: "USER",
      },
    });
  }

  const createdBookings = await prisma.$transaction(async (tx) => {
    const bookings = [];
    for (const seat of seats) {
      const b = await tx.booking.create({
        data: {
          seatNumber: String(seat).trim().toUpperCase(),
          status: status,
          totalPrice: trip.price,
          userId: user.id,
          tripId: trip.id,
        },
      });
      bookings.push(b);
    }

    if (status !== "CANCELLED") {
      const newAvailable = Math.max(0, trip.availableSeats - seats.length);
      await tx.trip.update({
        where: { id: trip.id },
        data: { availableSeats: newAvailable },
      });
    }

    return bookings;
  });

  const pnrCode = `NHAXE-${trip.code}-${user.id}${createdBookings[0].id}`;

  return {
    pnr: pnrCode,
    tripCode: trip.code,
    tripId: trip.id,
    passenger: {
      name: user.fullName,
      phone: user.phone,
    },
    seats,
    totalPrice: trip.price * seats.length,
    bookingIds: createdBookings.map((b) => b.id),
  };
}

/**
 * Tra cứu danh sách đơn hàng cho giao diện quản trị Admin
 */
export async function queryOrdersAdmin(params: OrderQueryParams): Promise<{
  data: OrderItem[];
  pagination: PaginationMeta;
  stats: OrderStats;
}> {
  const {
    search = "",
    status = "",
    date = "",
    tripId = "",
    page = 1,
    limit = 8,
    sortBy = "id",
    sortOrder = "desc",
  } = params;

  const where: any = {};

  if (search.trim()) {
    const s = search.trim();
    const num = Number(s);
    where.OR = [
      ...(!isNaN(num) ? [{ id: num }] : []),
      { seatNumber: { contains: s } },
      { user: { fullName: { contains: s } } },
      { user: { phone: { contains: s } } },
      { trip: { code: { contains: s } } },
      { trip: { from: { contains: s } } },
      { trip: { to: { contains: s } } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (tripId) {
    const numTrip = Number(tripId);
    if (!isNaN(numTrip)) where.tripId = numTrip;
  }

  if (date) {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      const startOfDay = new Date(parsedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(parsedDate);
      endOfDay.setHours(23, 59, 59, 999);
      where.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }
  }

  const numLimit = Math.max(1, Number(limit) || 8);
  const numPage = Math.max(1, Number(page) || 1);

  const [total, allBookings] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      select: {
        status: true,
        totalPrice: true,
      },
    }),
  ]);

  const stats: OrderStats = {
    total: allBookings.length,
    confirmed: allBookings.filter((b) => b.status === "CONFIRMED").length,
    pending: allBookings.filter((b) => b.status === "PENDING").length,
    cancelled: allBookings.filter((b) => b.status === "CANCELLED").length,
    totalRevenue: allBookings
      .filter((b) => b.status === "CONFIRMED")
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0),
  };

  const totalPages = Math.ceil(total / numLimit) || 1;
  const validPage = Math.min(numPage, totalPages);
  const skip = (validPage - 1) * numLimit;

  let orderBy: any = {};
  if (sortBy === "totalPrice" || sortBy === "createdAt") {
    orderBy[sortBy] = sortOrder === "asc" ? "asc" : "desc";
  } else {
    orderBy = { id: "desc" };
  }

  const bookings = await prisma.booking.findMany({
    where,
    orderBy,
    skip,
    take: numLimit,
    include: {
      user: true,
      trip: true,
    },
  });

  const data: OrderItem[] = bookings.map((b) => ({
    id: b.id,
    pnr: `NHAXE-${b.trip?.code || "T"}-${b.userId}${b.id}`,
    seatNumber: b.seatNumber,
    status: b.status as BookingStatus,
    totalPrice: b.totalPrice,
    createdAt: b.createdAt.toISOString(),
    user: {
      id: b.user.id,
      fullName: b.user.fullName,
      phone: b.user.phone,
      role: b.user.role,
    },
    trip: {
      id: b.trip.id,
      code: b.trip.code,
      from: b.trip.from,
      to: b.trip.to,
      time: b.trip.time.toISOString(),
      price: b.trip.price,
      availableSeats: b.trip.availableSeats,
    },
  }));

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

/**
 * Lấy chi tiết một đơn hàng theo ID
 */
export async function getOrderById(id: number | string): Promise<OrderItem | null> {
  const numId = Number(id);
  if (isNaN(numId)) return null;

  const b = await prisma.booking.findUnique({
    where: { id: numId },
    include: {
      user: true,
      trip: true,
    },
  });

  if (!b) return null;

  return {
    id: b.id,
    pnr: `NHAXE-${b.trip?.code || "T"}-${b.userId}${b.id}`,
    seatNumber: b.seatNumber,
    status: b.status as BookingStatus,
    totalPrice: b.totalPrice,
    createdAt: b.createdAt.toISOString(),
    user: {
      id: b.user.id,
      fullName: b.user.fullName,
      phone: b.user.phone,
      role: b.user.role,
    },
    trip: {
      id: b.trip.id,
      code: b.trip.code,
      from: b.trip.from,
      to: b.trip.to,
      time: b.trip.time.toISOString(),
      price: b.trip.price,
      availableSeats: b.trip.availableSeats,
    },
  };
}

/**
 * Cập nhật trạng thái đơn vé xe (Ví dụ: CONFIRMED, CANCELLED, PENDING)
 * Tự động hoàn trả số ghế trống khi HỦY VÉ, hoặc trừ số ghế trống khi kích hoạt lại
 */
export async function updateOrderStatus(
  id: number | string,
  newStatus: BookingStatus
): Promise<OrderItem | null> {
  const numId = Number(id);
  if (isNaN(numId)) return null;

  const existing = await prisma.booking.findUnique({
    where: { id: numId },
    include: { trip: true },
  });

  if (!existing) return null;
  const oldStatus = existing.status;

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: numId },
      data: { status: newStatus },
    });

    // Nếu chuyển từ CONFIRMED / PENDING sang CANCELLED => Hoàn lại 1 ghế
    if (oldStatus !== "CANCELLED" && newStatus === "CANCELLED") {
      await tx.trip.update({
        where: { id: existing.tripId },
        data: { availableSeats: { increment: 1 } },
      });
    }

    // Nếu chuyển từ CANCELLED sang CONFIRMED / PENDING => Trừ lại 1 ghế
    if (oldStatus === "CANCELLED" && newStatus !== "CANCELLED") {
      await tx.trip.update({
        where: { id: existing.tripId },
        data: {
          availableSeats: {
            decrement: existing.trip.availableSeats > 0 ? 1 : 0,
          },
        },
      });
    }
  });

  return await getOrderById(numId);
}

/**
 * Xóa một đơn hàng (và hoàn lại số ghế nếu chưa bị hủy)
 */
export async function deleteOrder(id: number | string): Promise<boolean> {
  const numId = Number(id);
  if (isNaN(numId)) return false;

  const existing = await prisma.booking.findUnique({
    where: { id: numId },
  });

  if (!existing) return false;

  await prisma.$transaction(async (tx) => {
    if (existing.status !== "CANCELLED") {
      await tx.trip.update({
        where: { id: existing.tripId },
        data: { availableSeats: { increment: 1 } },
      });
    }
    await tx.booking.delete({
      where: { id: numId },
    });
  });

  return true;
}

export interface GetBookingsFilter {
  query?: string;
  phone?: string;
  limit?: number;
}

export async function getBookings({
  query = "",
  phone = "",
  limit = 50,
}: GetBookingsFilter = {}) {
  const target = (phone || query).trim();

  if (!target) {
    return await prisma.booking.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        trip: true,
        user: true,
      },
    });
  }

  const numTarget = Number(target);
  return await prisma.booking.findMany({
    where: {
      OR: [
        { user: { phone: { contains: target } } },
        { user: { fullName: { contains: target } } },
        ...(!isNaN(numTarget) ? [{ id: numTarget }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      trip: true,
      user: true,
    },
  });
}
