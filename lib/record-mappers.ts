import type { bus as BusRecord, employee as EmployeeRecord, Prisma } from "@prisma/client";
import type { Bus, Employee, OrderItem, BookingStatus } from "@/types";

export function toEmployee(record: EmployeeRecord): Employee {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    phone: record.phone,
    role: record.role,
    department: record.department,
    status: record.status,
    avatar: record.avatar || undefined,
    identityCard: record.identityCard || undefined,
    address: record.address || undefined,
    startDate: record.startDate,
    createdAt: record.createdAt.toISOString(),
  };
}

export function toBus(record: BusRecord): Bus {
  return {
    id: record.id,
    plate: record.plate,
    type: record.type,
    seats: record.seats,
    status: record.status,
    brand: record.brand || undefined,
    year: record.year || undefined,
    driverName: record.driverName || undefined,
    driverPhone: record.driverPhone || undefined,
    lastMaintenance: record.lastMaintenance || undefined,
    notes: record.notes || undefined,
    createdAt: record.createdAt.toISOString(),
  };
}

type BookingWithRelations = Prisma.bookingGetPayload<{ include: { user: true; trip: true } }>;

export function toOrderItem(record: BookingWithRelations): OrderItem {
  return {
    id: record.id,
    pnr: record.pnr ?? `NHAXE-${record.trip.id}-${record.userId}${record.id}`,
    seatNumber: record.seatNumber,
    status: record.status as BookingStatus,
    totalPrice: record.totalPrice,
    createdAt: record.createdAt.toISOString(),
    user: {
      id: record.user.id,
      fullName: record.passengerName ?? record.user.fullName,
      phone: record.passengerPhone ?? record.user.phone,
      role: record.user.role,
    },
    trip: {
      id: record.trip.id,
      from: record.trip.from,
      to: record.trip.to,
      time: record.trip.time.toISOString(),
      price: record.trip.price,
      availableSeats: record.trip.availableSeats,
    },
  };
}
