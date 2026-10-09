import { BusinessError } from "@/lib/business-error";
import { runTransaction } from "@/lib/transaction";
import { getSeatCodes } from "@/lib/seats";
import { getDepartureDayRange } from "@/lib/trip-search";
import { positiveInteger } from "@/lib/query-params";
import { assertTripId } from "@/lib/trip-id";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { OrderItem, OrderQueryParams, PaginationMeta, OrderStats, BookingStatus } from "@/types";
import { toOrderItem } from "@/lib/record-mappers";

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
    tripId,
    page = 1,
    limit = 8,
    sortBy = "id",
    sortOrder = "desc",
  } = params;

  const where: Prisma.bookingWhereInput = {};

  if (search.trim()) {
    const s = search.trim();
    const num = Number(s);
    where.OR = [
      ...(Number.isInteger(num) && num > 0 && num <= 2147483647 ? [{ id: num }, { tripId: num }] : []),
      { pnr: { contains: s } },
      { passengerName: { contains: s } },
      { passengerPhone: { contains: s } },
      { seatNumber: { contains: s } },
      { user: { fullName: { contains: s } } },
      { user: { phone: { contains: s } } },
      { trip: { from: { contains: s } } },
      { trip: { to: { contains: s } } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (tripId !== undefined) where.tripId = assertTripId(tripId);

  if (date) {
    const range = getDepartureDayRange(date);
    if (!range) throw new BusinessError("Ngày lọc không hợp lệ.");
    where.createdAt = range;
  }

  const numLimit = positiveInteger(limit, 8, 100);
  const numPage = positiveInteger(page, 1);

  const [total, statusCounts] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.groupBy({ by: ["status"], where, _count: { _all: true }, _sum: { totalPrice: true } }),
  ]);
  const countStatus = (status: string) => statusCounts.find((group) => group.status === status)?._count._all ?? 0;
  const stats: OrderStats = {
    total: statusCounts.reduce((sum, group) => sum + group._count._all, 0),
    confirmed: countStatus("CONFIRMED"),
    pending: countStatus("PENDING"),
    cancelled: countStatus("CANCELLED"),
    totalRevenue: statusCounts.find((group) => group.status === "CONFIRMED")?._sum.totalPrice ?? 0,
  };

  const totalPages = Math.ceil(total / numLimit) || 1;
  const validPage = Math.min(numPage, totalPages);
  const skip = (validPage - 1) * numLimit;

  let orderBy: Prisma.bookingOrderByWithRelationInput = {};
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

  const data: OrderItem[] = bookings.map(toOrderItem);

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

  return toOrderItem(b);
}

export async function updateOrderStatus(id: number | string, newStatus: BookingStatus): Promise<OrderItem | null> {
  if (!["CONFIRMED", "PENDING", "CANCELLED"].includes(newStatus)) throw new BusinessError("Trạng thái vé không hợp lệ.");
  const changed = await runTransaction(async (tx) => {
    const existing = await tx.booking.findUnique({ where: { id: Number(id) }, include: { trip: true } });
    if (!existing) return false;
    if (existing.status === newStatus) return true;
    if (existing.status === "CONFIRMED" && newStatus === "PENDING") throw new BusinessError("Vé đã thanh toán không thể chuyển về chờ thanh toán.", 409);
    if (existing.trip.time <= new Date() && (newStatus === "CANCELLED" || existing.status === "CANCELLED")) throw new BusinessError("Chuyến xe đã xuất bến. Không thể thay đổi trạng thái vé.", 409);

    if (existing.status === "CANCELLED" && newStatus !== "CANCELLED") {
      if (!getSeatCodes(existing.trip.capacity).includes(existing.seatNumber)) throw new BusinessError("Ghế không còn thuộc sơ đồ hiện tại. Không thể khôi phục vé.", 409);
      const conflict = await tx.booking.findFirst({ where: { activeSeat: `${existing.tripId}:${existing.seatNumber}` } });
      const held = await tx.seatHold.findFirst({ where: { tripId: existing.tripId, seatNumber: existing.seatNumber, expiresAt: { gt: new Date() } } });
      if (conflict || held) throw new BusinessError("Ghế này đã được đặt hoặc đang được giữ. Không thể khôi phục vé.", 409);
      const reserved = await tx.trip.updateMany({ where: { id: existing.tripId, availableSeats: { gt: 0 } }, data: { availableSeats: { decrement: 1 } } });
      if (reserved.count !== 1) throw new BusinessError("Chuyến xe đã hết ghế. Không thể khôi phục vé.", 409);
    }
    await tx.booking.update({ where: { id: existing.id }, data: {
      status: newStatus, activeSeat: newStatus === "CANCELLED" ? null : `${existing.tripId}:${existing.seatNumber}`,
      confirmedAt: newStatus === "CONFIRMED" ? new Date() : newStatus === "PENDING" ? null : existing.confirmedAt,
    } });
    if (existing.status !== "CANCELLED" && newStatus === "CANCELLED") {
      await tx.trip.update({ where: { id: existing.tripId }, data: { availableSeats: { increment: 1 } } });
    }
    return true;
  });
  return changed ? getOrderById(id) : null;
}

// DELETE là hủy vé có giữ lịch sử, để tài khoản và doanh thu vẫn có thể đối chiếu.
export async function deleteOrder(id: number | string): Promise<boolean> {
  return Boolean(await updateOrderStatus(id, "CANCELLED"));
}
