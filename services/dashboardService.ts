import { formatDepartureDate, getDepartureDayRange, getVietnamMonthStart } from "@/lib/trip-search";
import { prisma } from "@/lib/prisma";
import { toOrderItem } from "@/lib/record-mappers";
import type { DashboardStats, SystemAlert } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const { gte: startToday, lt: startTomorrow } = getDepartureDayRange(formatDepartureDate(now))!;
  const startYesterday = new Date(startToday.getTime() - 24 * 60 * 60 * 1000);
  const startThisMonth = getVietnamMonthStart(now);
  const startLastMonth = getVietnamMonthStart(now, -1);

  const [thisMonth, lastMonth, today, ticketsSoldYesterday, busCounts, employeeCounts,
    totalTrips, totalUsers, recentBookings, maintenanceBuses, onLeaveEmployees] = await Promise.all([
    prisma.booking.aggregate({ where: { status: "CONFIRMED", confirmedAt: { gte: startThisMonth } }, _sum: { totalPrice: true } }),
    prisma.booking.aggregate({ where: { status: "CONFIRMED", confirmedAt: { gte: startLastMonth, lt: startThisMonth } }, _sum: { totalPrice: true } }),
    prisma.booking.aggregate({ where: { status: "CONFIRMED", confirmedAt: { gte: startToday, lt: startTomorrow } }, _sum: { totalPrice: true }, _count: { _all: true } }),
    prisma.booking.count({ where: { status: "CONFIRMED", confirmedAt: { gte: startYesterday, lt: startToday } } }),
    prisma.bus.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.employee.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.trip.count(),
    prisma.user.count(),
    prisma.booking.findMany({ take: 6, orderBy: [{ createdAt: "desc" }, { id: "desc" }], include: { user: true, trip: true } }),
    prisma.bus.findMany({ where: { status: "Bảo dưỡng" }, take: 3, orderBy: { id: "asc" }, select: { plate: true } }),
    prisma.employee.findMany({ where: { status: "Nghỉ phép" }, take: 3, orderBy: { id: "asc" }, select: { name: true } }),
  ]);

  const revenueThisMonth = thisMonth._sum.totalPrice ?? 0;
  const revenueLastMonth = lastMonth._sum.totalPrice ?? 0;
  const ticketsSoldToday = today._count._all;
  const totalBuses = busCounts.reduce((sum, group) => sum + group._count._all, 0);
  const totalEmployees = employeeCounts.reduce((sum, group) => sum + group._count._all, 0);
  const maintenanceCount = busCounts.find((group) => group.status === "Bảo dưỡng")?._count._all ?? 0;
  const leaveCount = employeeCounts.find((group) => group.status === "Nghỉ phép")?._count._all ?? 0;
  const systemAlerts: SystemAlert[] = [];

  if (maintenanceCount > 0) {
    systemAlerts.push({ id: "alert-maintenance", type: "warning", title: `${maintenanceCount} xe đang bảo dưỡng`,
      message: `Bao gồm: ${maintenanceBuses.map((bus) => bus.plate).join(", ")}. Cần kiểm tra tiến độ trả xe.`, time: "Khi tải dữ liệu" });
  }
  if (leaveCount > 0) {
    systemAlerts.push({ id: "alert-leave", type: "info", title: `${leaveCount} nhân sự đang nghỉ phép`,
      message: `Bao gồm: ${onLeaveEmployees.map((employee) => employee.name).join(", ")}. Cần kiểm tra lịch phân công.`, time: "Khi tải dữ liệu" });
  }

  return {
    revenueThisMonth,
    revenueToday: today._sum.totalPrice ?? 0,
    revenueGrowthPercent: growthPercent(revenueThisMonth, revenueLastMonth),
    ticketsSoldToday,
    ticketsGrowthPercent: growthPercent(ticketsSoldToday, ticketsSoldYesterday),
    totalBuses,
    activeBuses: busCounts.find((group) => group.status === "Đang hoạt động")?._count._all ?? 0,
    totalEmployees,
    activeEmployees: employeeCounts.find((group) => group.status === "Đang làm việc")?._count._all ?? 0,
    totalTrips, totalUsers,
    recentOrders: recentBookings.map(toOrderItem),
    systemAlerts,
  };
}

function growthPercent(current: number, previous: number) {
  if (previous > 0) return Math.round((current - previous) / previous * 100);
  return current > 0 ? 100 : 0;
}
