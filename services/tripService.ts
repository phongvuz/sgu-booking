import { assertTripId } from "@/lib/trip-id";
import { BusinessError } from "@/lib/business-error";
import { runTransaction } from "@/lib/transaction";
import { getSeatCodes } from "@/lib/seats";
import { formatDepartureDate, getDepartureDayRange, parseVietnamDateTime } from "@/lib/trip-search";
import { positiveInteger } from "@/lib/query-params";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { PaginationMeta, TripAdminItem, TripQueryParams, TripStats, TripSearchOption } from "@/types";
import { broadcastSeatRefresh } from "@/lib/sse";
import { tripStatuses, tripStatusTransitions, type TripStatus } from "@/lib/trip-status";
import { getBookingMoney } from "@/lib/booking-money";
import { assertTripPrice } from "@/lib/money";
import { tripTimeSlots, type TripTimeSlot, type TripVehicleFilter } from "@/lib/public-trip-search";

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
    status: "OPEN",
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
  endsAt?: Date | string | null;
  status?: TripStatus;
  busId?: string | null;
  driverId?: string | null;
}

interface UpdateTripInput {
  from?: string;
  to?: string;
  time?: Date | string;
  price?: number;
  capacity?: number;
  endsAt?: Date | string | null;
  status?: TripStatus;
  busId?: string | null;
  driverId?: string | null;
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

  if (bookable) { where.status = "OPEN"; where.time = { gt: new Date() }; where.availableSeats = { gt: 0 }; }

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
        bus: true,
        driver: true,
        booking: {
          include: {
            transactions: true,
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
      endsAt: t.endsAt?.toISOString() ?? null,
      status: t.status,
      busId: t.busId,
      driverId: t.driverId,
      busPlate: t.bus?.plate ?? "",
      driverName: t.driver?.name ?? "",
      price: t.price,
      availableSeats: t.availableSeats,
      totalSeats,
      bookedSeatsCount: bookedCount,
      occupancyRate,
      createdAt: t.createdAt.toISOString(),
      bookings: t.booking.map((b) => ({
        ...getBookingMoney(b.totalPrice, b.status, b.transactions),
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
    skip: (positiveInteger(page, 1, Math.floor(2147483647 / take) + 1) - 1) * take,
    take,
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
  const conditions = [Prisma.sql`status = 'OPEN'`, Prisma.sql`time > ${now}`, Prisma.sql`availableSeats > 0`];
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

async function checkTripAssignment(tx: Prisma.TransactionClient, data: CreateTripInput, id?: number) {
  const time = parseVietnamDateTime(data.time);
  const endsAt = data.endsAt ? parseVietnamDateTime(data.endsAt) : null;
  if (endsAt && (!Number.isFinite(endsAt.getTime()) || endsAt <= time)) {
    throw new BusinessError("Giờ kết thúc phải sau giờ xuất bến.");
  }
  if (!Number.isInteger(data.capacity) || data.capacity < 1 || data.capacity > 60) {
    throw new BusinessError("Sức chứa phải từ 1 đến 60 ghế.");
  }
  const bus = data.busId ? await tx.bus.findUnique({ where: { id: data.busId } }) : null;
  const driver = data.driverId ? await tx.employee.findUnique({ where: { id: data.driverId } }) : null;
  if (data.busId && !bus) throw new BusinessError("Xe không tồn tại.");
  if (data.driverId && !driver) throw new BusinessError("Tài xế không tồn tại.");
  if (bus && bus.seats !== data.capacity) throw new BusinessError("Sức chứa chuyến phải bằng số ghế của xe.");
  if (data.status !== "OPEN" && data.status !== "DEPARTED") return;
  if (!bus || !driver || !endsAt) {
    throw new BusinessError("Cần chọn xe, tài xế và giờ kết thúc trước khi mở bán.");
  }
  if (bus.status !== "Đang hoạt động") {
    throw new BusinessError("Xe đang bảo dưỡng hoặc ngừng hoạt động.", 409);
  }
  if (driver.status !== "Đang làm việc" || driver.role !== "Tài xế") {
    throw new BusinessError("Nhân viên phải là tài xế đang làm việc.", 409);
  }
  const conflict = await tx.trip.findFirst({
    where: {
      ...(id ? { id: { not: id } } : {}),
      OR: [{ busId: bus.id }, { driverId: driver.id }],
      AND: [{
        OR: [
          { status: { in: ["OPEN", "DEPARTED"] }, time: { lt: endsAt }, endsAt: { gt: time } },
          ...((data.status === "DEPARTED" || time <= new Date()) ? [{ status: "DEPARTED" }] : []),
        ],
      }],
    },
  });
  if (conflict) {
    throw new BusinessError(`Xe hoặc tài xế đang bận ở chuyến ${conflict.id}. Kiểm tra lịch và trạng thái hoàn thành chuyến.`, 409);
  }
}

export async function createTrip(data: CreateTripInput) {
  const time = parseVietnamDateTime(data.time);
  if (!Number.isFinite(time.getTime()) || time <= new Date()) throw new BusinessError("Chọn thời gian xuất bến trong tương lai.");
  const status = data.status ?? "DRAFT";
  if (status !== "DRAFT" && status !== "OPEN") throw new BusinessError("Chuyến mới chỉ được ở trạng thái dự kiến hoặc mở bán.");
  return runTransaction(async (tx) => {
    await checkTripAssignment(tx, { ...data, status });
    return tx.trip.create({
      data: {
        from: data.from.trim(),
        to: data.to.trim(),
        time,
        price: data.price,
        capacity: data.capacity,
        availableSeats: data.capacity,
        status,
        endsAt: data.endsAt ? parseVietnamDateTime(data.endsAt) : null,
        busId: data.busId || null,
        driverId: data.driverId || null,
      },
    });
  });
}

export async function updateTrip(tripId: number, data: UpdateTripInput) {
  const id = assertTripId(tripId);
  if (data.price !== undefined) assertTripPrice(data.price);
  const updated = await runTransaction(async (tx) => {
    const trip = await tx.trip.findUnique({ where: { id }, include: { booking: { where: { status: { not: "CANCELLED" } } } } });
    if (!trip) return null;
    const time = data.time ? parseVietnamDateTime(data.time) : trip.time;
    if (!Number.isFinite(time.getTime())) throw new BusinessError("Thời gian xuất bến không hợp lệ.");
    if (time.getTime() !== trip.time.getTime() && time <= new Date()) throw new BusinessError("Chọn thời gian xuất bến trong tương lai.");
    const from = data.from ?? trip.from;
    const to = data.to ?? trip.to;
    const status = data.status ?? trip.status;
    if (!tripStatuses.includes(status as TripStatus) || !tripStatusTransitions[trip.status]?.includes(status as TripStatus)) {
      throw new BusinessError("Không thể chuyển sang trạng thái chuyến này.", 409);
    }
    if (status === "OPEN" && trip.status !== "OPEN" && time <= new Date()) throw new BusinessError("Chuyến đã đến giờ xuất bến. Không thể mở bán.", 409);
    if ((status === "DEPARTED" || status === "COMPLETED") && time > new Date()) throw new BusinessError("Chuyến chưa đến giờ xuất bến.", 409);
    const routeChanged = from !== trip.from || to !== trip.to || time.getTime() !== trip.time.getTime();
    if (trip.booking.length && routeChanged) {
      throw new BusinessError("Chuyến có vé đang hiệu lực. Không thể đổi hành trình hoặc giờ xuất bến.", 409);
    }
    const capacity = data.capacity ?? trip.capacity;
    const busId = data.busId === undefined ? trip.busId : data.busId;
    const driverId = data.driverId === undefined ? trip.driverId : data.driverId;
    const endsAt = data.endsAt === undefined ? trip.endsAt : data.endsAt ? parseVietnamDateTime(data.endsAt) : null;
    const closesSales = status !== trip.status && (status === "DRAFT" || status === "CANCELLED");
    if (closesSales && trip.booking.length) throw new BusinessError("Hủy từng vé trước khi đóng hoặc hủy chuyến. Tiền đã thu sẽ được đưa vào chờ hoàn.", 409);
    if (routeChanged || capacity !== trip.capacity || busId !== trip.busId || closesSales) {
      if (await tx.seatHold.count({ where: { tripId: id, expiresAt: { gt: new Date() } } })) throw new BusinessError("Khách đang giữ ghế. Chưa thể đổi hành trình, xe, sơ đồ ghế hoặc đóng chuyến.", 409);
    }
    if ((trip.status === "DEPARTED" || trip.status === "COMPLETED" || trip.status === "CANCELLED") && (routeChanged || capacity !== trip.capacity || busId !== trip.busId || driverId !== trip.driverId || endsAt?.getTime() !== trip.endsAt?.getTime())) throw new BusinessError("Chuyến đã xuất bến hoặc kết thúc. Không thể đổi phân công hay hành trình.", 409);
    await checkTripAssignment(tx, { from, to, time, price: data.price ?? trip.price, capacity, status: status as TripStatus, busId, driverId, endsAt }, id);
    const validSeats = getSeatCodes(capacity);
    if (trip.booking.some((booking) => !validSeats.includes(booking.seatNumber))) {
      throw new BusinessError("Sức chứa mới loại bỏ ghế đã bán. Vui lòng chọn sức chứa lớn hơn.", 409);
    }
    // Số ghế trống được tính từ sức chứa và vé hiệu lực, admin không sửa trực tiếp.
    if (await tx.seatHold.count({ where: { tripId: trip.id, seatNumber: { notIn: validSeats }, expiresAt: { gt: new Date() } } })) {
      throw new BusinessError("Có ghế đang được giữ nằm ngoài sức chứa mới. Vui lòng chờ hết thời gian giữ ghế.", 409);
    }
    await tx.seatHold.deleteMany({ where: { tripId: trip.id, seatNumber: { notIn: validSeats } } });
    return tx.trip.update({ where: { id: trip.id }, data: { from, to, time, price: data.price, capacity, status, busId, driverId, endsAt, availableSeats: capacity - trip.booking.length } });
  });
  if (updated) broadcastSeatRefresh(id);
  return updated;
}

export async function deleteTrip(tripId: number) {
  const id = assertTripId(tripId);
  return runTransaction(async (tx) => {
    const trip = await tx.trip.findUnique({ where: { id } });
    if (!trip) return null;
    if (await tx.booking.count({ where: { tripId: trip.id } })) throw new BusinessError("Chuyến có lịch sử vé, không thể xóa.", 409);
    if (await tx.seatHold.count({ where: { tripId: trip.id, expiresAt: { gt: new Date() } } })) throw new BusinessError("Khách đang giữ ghế, chưa thể xóa chuyến.", 409);
    return tx.trip.delete({ where: { id: trip.id } });
  });
}

export async function getTripSearchOptions(): Promise<TripSearchOption[]> {
  const trips = await prisma.trip.findMany({
    where: { status: "OPEN", time: { gt: new Date() }, availableSeats: { gt: 0 } },
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
    where: { status: "OPEN", time: { gte: new Date() }, availableSeats: { gt: 0 } },
    _min: { price: true },
    orderBy: { _min: { price: "asc" } },
    take: 3,
  });
}
