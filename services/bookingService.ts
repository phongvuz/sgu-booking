import { prisma } from "@/lib/prisma";

export interface CreateBookingInput {
  tripId: string | number;
  seats: string[];
  fullName: string;
  phone: string;
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
    this.name = "TripNotFoundError";
  }
}

/**
 * Đặt vé xe mới, kiểm tra ghế trùng và cập nhật số ghế trống (Transaction)
 */
export async function createBooking({
  tripId,
  seats,
  fullName,
  phone,
}: CreateBookingInput): Promise<BookingResult> {
  const numTripId = Number(tripId);

  // 1. Tìm chuyến xe theo id hoặc code
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

  // 2. Lấy danh sách ghế đã được đặt (lọc status != CANCELLED ngay tại database)
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

  // 3. Tìm hoặc tạo người dùng theo số điện thoại
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

  // 4. Tạo các bản ghi Booking và trừ ghế trống trong Database Transaction
  const createdBookings = await prisma.$transaction(async (tx) => {
    const bookings = [];
    for (const seat of seats) {
      const b = await tx.booking.create({
        data: {
          seatNumber: String(seat).trim(),
          status: "CONFIRMED",
          totalPrice: trip.price,
          userId: user.id,
          tripId: trip.id,
        },
      });
      bookings.push(b);
    }

    // Cập nhật số ghế trống còn lại trong chuyến xe
    const newAvailable = Math.max(0, trip.availableSeats - seats.length);
    await tx.trip.update({
      where: { id: trip.id },
      data: { availableSeats: newAvailable },
    });

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

export interface GetBookingsFilter {
  query?: string;
  phone?: string;
  limit?: number;
}

/**
 * Tra cứu danh sách vé đã đặt từ cơ sở dữ liệu
 */
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
