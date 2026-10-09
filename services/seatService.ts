import { prisma } from "@/lib/prisma";
import { runTransaction } from "@/lib/transaction";
import { BusinessError } from "@/lib/business-error";
import { getSeatCodes, normalizeSeat } from "@/lib/seats";
import { assertTripId } from "@/lib/trip-id";

export function getActiveSeatHolds(tripId: number) {
  assertTripId(tripId);
  return prisma.seatHold.findMany({ where: { tripId, expiresAt: { gt: new Date() } }, select: { seatNumber: true, clientId: true } });
}

export async function holdSeat(tripId: number, seatNumber: string, clientId: string) {
  assertTripId(tripId);
  const seat = normalizeSeat(seatNumber);
  return runTransaction(async (tx) => {
    const trip = await tx.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new BusinessError("Không tìm thấy chuyến xe.", 404);
    if (trip.time <= new Date() || trip.availableSeats <= 0) throw new BusinessError("Chuyến đã xuất bến hoặc hết ghế.", 409);
    if (!getSeatCodes(trip.capacity).includes(seat)) throw new BusinessError("Ghế không thuộc sơ đồ chuyến xe.");
    if (await tx.booking.findFirst({ where: { activeSeat: `${tripId}:${seat}` } })) throw new BusinessError("Ghế đã được đặt.", 409);
    const now = new Date();
    const existing = await tx.seatHold.findUnique({ where: { tripId_seatNumber: { tripId, seatNumber: seat } } });
    if (existing && existing.clientId !== clientId && existing.expiresAt > now) throw new BusinessError("Ghế đang được người khác giữ.", 409);
    const ownActiveHold = existing?.clientId === clientId && existing.expiresAt > now;
    const count = await tx.seatHold.count({ where: { tripId, clientId, expiresAt: { gt: now } } });
    if (!ownActiveHold && count >= 5) throw new BusinessError("Mỗi lượt giữ tối đa 5 ghế.", 409);
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);
    if (existing) return tx.seatHold.update({ where: { id: existing.id }, data: { clientId, expiresAt } });
    return tx.seatHold.create({ data: { tripId, seatNumber: seat, clientId, expiresAt } });
  });
}

export function releaseSeat(tripId: number, seatNumber: string, clientId: string) {
  assertTripId(tripId);
  return prisma.seatHold.deleteMany({ where: { tripId, seatNumber: normalizeSeat(seatNumber), clientId } });
}
