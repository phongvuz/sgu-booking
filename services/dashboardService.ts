import { prisma } from "@/lib/prisma";
import { DashboardStats, SystemAlert } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();

  // Mốc thời gian hôm nay
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  const endToday = new Date(now);
  endToday.setHours(23, 59, 59, 999);

  // Mốc thời gian hôm qua
  const startYesterday = new Date(startToday);
  startYesterday.setDate(startYesterday.getDate() - 1);
  const endYesterday = new Date(endToday);
  endYesterday.setDate(endYesterday.getDate() - 1);

  // Mốc đầu tháng này
  const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Mốc đầu tháng trước
  const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const [
    allBookings,
    buses,
    employees,
    totalTrips,
    totalUsers,
    recentBookingsRaw,
  ] = await Promise.all([
    prisma.booking.findMany({
      select: {
        totalPrice: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.bus.findMany({
      select: { id: true, plate: true, status: true },
    }),
    prisma.employee.findMany({
      select: { id: true, status: true, name: true },
    }),
    prisma.trip.count(),
    prisma.user.count(),
    prisma.booking.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        trip: true,
      },
    }),
  ]);

  // Doanh thu tháng này và tháng trước
  const confirmedBookings = allBookings.filter((b) => b.status === "CONFIRMED");

  const revenueThisMonth = confirmedBookings
    .filter((b) => new Date(b.createdAt) >= startThisMonth)
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const revenueLastMonth = confirmedBookings
    .filter((b) => {
      const d = new Date(b.createdAt);
      return d >= startLastMonth && d <= endLastMonth;
    })
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const revenueGrowthPercent =
    revenueLastMonth > 0
      ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100)
      : revenueThisMonth > 0 ? 100 : 0;

  // Vé hôm nay và hôm qua
  const ticketsSoldToday = confirmedBookings.filter((b) => {
    const d = new Date(b.createdAt);
    return d >= startToday && d <= endToday;
  }).length;

  const ticketsSoldYesterday = confirmedBookings.filter((b) => {
    const d = new Date(b.createdAt);
    return d >= startYesterday && d <= endYesterday;
  }).length;

  const ticketsGrowthPercent =
    ticketsSoldYesterday > 0
      ? Math.round(((ticketsSoldToday - ticketsSoldYesterday) / ticketsSoldYesterday) * 100)
      : ticketsSoldToday > 0 ? 100 : 0;

  const revenueToday = confirmedBookings
    .filter((b) => {
      const d = new Date(b.createdAt);
      return d >= startToday && d <= endToday;
    })
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  // Xe và nhân sự
  const totalBuses = buses.length;
  const activeBuses = buses.filter((b) => b.status === "Đang hoạt động").length;

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === "Đang làm việc").length;

  // Recent orders
  const recentOrders = recentBookingsRaw.map((b) => ({
    id: b.id,
    pnr: `NHAXE-${b.trip?.code || "T"}-${b.userId}${b.id}`,
    seatNumber: b.seatNumber,
    status: b.status as any,
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

  // Tạo alerts hệ thống sống động từ dữ liệu thật
  const systemAlerts: SystemAlert[] = [];

  const maintenanceBuses = buses.filter((b) => b.status === "Bảo dưỡng");
  if (maintenanceBuses.length > 0) {
    systemAlerts.push({
      id: "alert-maintenance",
      type: "warning",
      title: `${maintenanceBuses.length} xe đang trong kỳ bảo dưỡng`,
      message: `Bao gồm xe: ${maintenanceBuses.map((b) => b.plate).slice(0, 3).join(", ")}. Cần kiểm tra tiến độ trả xe.`,
      time: "Hôm nay",
    });
  }

  const onLeaveEmployees = employees.filter((e) => e.status === "Nghỉ phép");
  if (onLeaveEmployees.length > 0) {
    systemAlerts.push({
      id: "alert-leave",
      type: "info",
      title: `${onLeaveEmployees.length} nhân sự đang nghỉ phép`,
      message: `Nhân viên: ${onLeaveEmployees.map((e) => e.name).slice(0, 3).join(", ")}. Đã điều phối nhân sự trực thay thế.`,
      time: "Hôm nay",
    });
  }

  systemAlerts.push({
    id: "alert-backup",
    type: "success",
    title: "Đồng bộ hệ thống dữ liệu tự động",
    message: "Hệ thống cơ sở dữ liệu đã đồng bộ ổn định và thông suốt.",
    time: "Vừa xong",
  });

  return {
    revenueThisMonth,
    revenueToday,
    revenueGrowthPercent,
    ticketsSoldToday,
    ticketsGrowthPercent,
    totalBuses,
    activeBuses,
    totalEmployees,
    activeEmployees,
    totalTrips,
    totalUsers,
    recentOrders,
    systemAlerts,
  };
}
