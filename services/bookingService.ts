import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { BusinessError } from "@/lib/business-error";
import { hashPassword } from "@/lib/password";
import { runTransaction } from "@/lib/transaction";
import { getSeatCodes, normalizeSeat } from "@/lib/seats";
import { positiveInteger } from "@/lib/query-params";
import { assertTripId } from "@/lib/trip-id";
import type { CreateBookingInput, BookingResult } from "@/types";

export class BookingConflictError extends BusinessError {
  constructor(public conflictingSeats: string[]) {
    super(`Ghế ${conflictingSeats.join(", ")} đã được đặt hoặc đang được giữ. Vui lòng chọn ghế khác.`, 409);
    this.name = "BookingConflictError";
  }
}
export class TripNotFoundError extends BusinessError {
  constructor(tripId: number) {
    super(`Không tìm thấy chuyến xe với mã: ${tripId}`, 404);
    this.name = "TripNotFoundError";
  }
}

export async function createBooking(input: CreateBookingInput): Promise<BookingResult> {
  const id = assertTripId(input.tripId);
  const seats = input.seats.map(normalizeSeat);
  if (!seats.length || seats.length > 5 || new Set(seats).size !== seats.length) {
    throw new BusinessError("Mỗi lượt đặt từ 1 đến 5 ghế khác nhau.");
  }
  const status = input.status ?? "PENDING";
  if (status === "CANCELLED") throw new BusinessError("Vé mới phải chờ thanh toán hoặc đã thanh toán.");
  const fullName = input.fullName.trim();
  const phone = input.phone.trim();
  const guestPassword = await hashPassword(randomBytes(32).toString("hex"));

  return runTransaction(async (tx) => {
    const trip = await tx.trip.findUnique({ where: { id } });
    if (!trip) throw new TripNotFoundError(input.tripId);
    if (trip.time <= new Date()) throw new BusinessError("Chuyến xe đã xuất bến, không thể đặt thêm vé.", 409);
    const validSeats = getSeatCodes(trip.capacity);
    if (seats.some((seat) => !validSeats.includes(seat))) throw new BusinessError("Ghế đã chọn không thuộc sơ đồ ghế của chuyến xe.");
    const booked = await tx.booking.findMany({ where: { tripId: trip.id, status: { not: "CANCELLED" }, seatNumber: { in: seats } }, select: { seatNumber: true } });
    const held = await tx.seatHold.findMany({ where: {
      tripId: trip.id, seatNumber: { in: seats }, expiresAt: { gt: new Date() },
      ...(input.clientId ? { clientId: { not: input.clientId } } : {}),
    }, select: { seatNumber: true } });
    const conflicts = [...new Set([...booked, ...held].map((record) => record.seatNumber))];
    if (conflicts.length) throw new BookingConflictError(conflicts);

    // Điều kiện gte giữ số ghế trống không bao giờ âm.
    const reserved = await tx.trip.updateMany({ where: { id: trip.id, availableSeats: { gte: seats.length } }, data: { availableSeats: { decrement: seats.length } } });
    if (reserved.count !== 1) throw new BusinessError("Chuyến xe không còn đủ ghế trống.", 409);
    let user = input.ownerId
      ? await tx.user.findUnique({ where: { id: input.ownerId } })
      : await tx.user.findUnique({ where: { phone } });
    if (!user) user = await tx.user.create({ data: { fullName, phone, password: guestPassword, role: "USER" } });
    const bookings = [];
    for (const seatNumber of seats) {
      bookings.push(await tx.booking.create({ data: {
        seatNumber, status, totalPrice: trip.price, userId: user.id, tripId: trip.id,
        passengerName: fullName, passengerPhone: phone, activeSeat: `${trip.id}:${seatNumber}`,
        confirmedAt: status === "CONFIRMED" ? new Date() : null,
      } }));
    }
    // Một lượt đặt nhiều ghế dùng chung mã PNR, không thay đổi theo tài khoản.
    const pnr = `NHAXE-${trip.id}-${randomBytes(8).toString("hex").toUpperCase()}`;
    await tx.booking.updateMany({ where: { id: { in: bookings.map((booking) => booking.id) } }, data: { pnr } });
    await tx.seatHold.deleteMany({ where: { tripId: trip.id, seatNumber: { in: seats } } });
    return { pnr, tripId: trip.id, passenger: { name: fullName, phone }, seats,
      totalPrice: trip.price * seats.length, bookingIds: bookings.map((booking) => booking.id) };
  });
}

export interface GetBookingsFilter { query?: string; phone?: string; limit?: number }
export async function getBookings({ query = "", phone = "", limit = 50 }: GetBookingsFilter = {}) {
  const target = (phone || query).trim();
  if (!target) throw new BusinessError("Nhập đầy đủ số điện thoại hoặc mã đặt chỗ (PNR).");
  const bookings = await prisma.booking.findMany({
    where: { OR: [{ passengerPhone: target }, { pnr: target }] },
    orderBy: { createdAt: "desc" }, take: positiveInteger(limit, 50, 100),
    select: {
      id: true, pnr: true, seatNumber: true, status: true, totalPrice: true, createdAt: true,
      passengerName: true, passengerPhone: true,
      trip: { select: { id: true, from: true, to: true, time: true, price: true } },
    },
  });
  return bookings.map(({ passengerName, passengerPhone, ...booking }) => ({
    ...booking, user: { fullName: passengerName, phone: passengerPhone },
  }));
}
