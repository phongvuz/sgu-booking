import { prisma } from "@/lib/prisma";
import { UserAccount, UserQueryParams, PaginationMeta, UserStats } from "@/types";
import { UserFormValues } from "@/lib/validations/user";

/**
 * Lấy danh sách người dùng với tìm kiếm, phân trang và thống kê số vé đặt
 */
export async function queryUsers(params: UserQueryParams): Promise<{
  data: UserAccount[];
  pagination: PaginationMeta;
  stats: UserStats;
}> {
  const {
    search = "",
    role = "",
    page = 1,
    limit = 8,
    sortBy = "id",
    sortOrder = "desc",
  } = params;

  const where: any = {};

  if (search.trim()) {
    const s = search.trim();
    where.OR = [
      { fullName: { contains: s } },
      { phone: { contains: s } },
    ];
  }

  if (role) {
    where.role = role;
  }

  const numLimit = Math.max(1, Number(limit) || 8);
  const numPage = Math.max(1, Number(page) || 1);

  const [total, allUsers] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      select: {
        role: true,
        createdAt: true,
      },
    }),
  ]);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const stats: UserStats = {
    total: allUsers.length,
    users: allUsers.filter((u) => u.role === "USER").length,
    admins: allUsers.filter((u) => u.role === "ADMIN").length,
    newThisMonth: allUsers.filter((u) => new Date(u.createdAt) >= startOfMonth).length,
  };

  const totalPages = Math.ceil(total / numLimit) || 1;
  const validPage = Math.min(numPage, totalPages);
  const skip = (validPage - 1) * numLimit;

  let orderBy: any = {};
  if (sortBy === "fullName" || sortBy === "createdAt") {
    orderBy[sortBy] = sortOrder === "asc" ? "asc" : "desc";
  } else {
    orderBy = { id: "desc" };
  }

  const users = await prisma.user.findMany({
    where,
    orderBy,
    skip,
    take: numLimit,
    include: {
      _count: {
        select: { booking: true },
      },
      booking: {
        where: { status: "CONFIRMED" },
        select: { totalPrice: true },
      },
    },
  });

  const data: UserAccount[] = users.map((u) => {
    const totalSpent = u.booking.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    return {
      id: u.id,
      fullName: u.fullName,
      phone: u.phone,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
      _count: {
        booking: u._count.booking,
      },
      totalSpent,
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

/**
 * Lấy chi tiết thông tin người dùng kèm lịch sử đặt vé
 */
export async function getUserById(id: number | string) {
  const numId = Number(id);
  if (isNaN(numId)) return null;

  const user = await prisma.user.findUnique({
    where: { id: numId },
    include: {
      booking: {
        orderBy: { createdAt: "desc" },
        include: {
          trip: true,
        },
      },
    },
  });

  if (!user) return null;

  const totalSpent = user.booking
    .filter((b) => b.status === "CONFIRMED")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return {
    id: user.id,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    totalSpent,
    _count: {
      booking: user.booking.length,
    },
    bookings: user.booking.map((b) => ({
      id: b.id,
      seatNumber: b.seatNumber,
      status: b.status,
      totalPrice: b.totalPrice,
      createdAt: b.createdAt.toISOString(),
      trip: {
        id: b.trip.id,
        code: b.trip.code,
        from: b.trip.from,
        to: b.trip.to,
        time: b.trip.time.toISOString(),
      },
    })),
  };
}

/**
 * Kiểm tra xem số điện thoại đã tồn tại chưa
 */
export async function checkUserPhoneConflict(phone: string, excludeId?: number): Promise<boolean> {
  const existing = await prisma.user.findFirst({
    where: {
      phone: phone.trim(),
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });
  return !!existing;
}

/**
 * Tạo người dùng mới
 */
export async function createUser(data: UserFormValues) {
  return await prisma.user.create({
    data: {
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      password: data.password?.trim() || "password123",
      role: data.role || "USER",
    },
  });
}

/**
 * Cập nhật thông tin người dùng
 */
export async function updateUser(id: number | string, data: Partial<UserFormValues>) {
  const numId = Number(id);
  if (isNaN(numId)) return null;

  const updateData: any = {};
  if (data.fullName !== undefined) updateData.fullName = data.fullName.trim();
  if (data.phone !== undefined) updateData.phone = data.phone.trim();
  if (data.role !== undefined) updateData.role = data.role;
  if (data.password && data.password.trim()) updateData.password = data.password.trim();

  return await prisma.user.update({
    where: { id: numId },
    data: updateData,
  });
}

/**
 * Xóa người dùng
 */
export async function deleteUser(id: number | string): Promise<boolean> {
  const numId = Number(id);
  if (isNaN(numId)) return false;

  try {
    await prisma.user.delete({
      where: { id: numId },
    });
    return true;
  } catch (err) {
    console.error("Error deleting user:", err);
    return false;
  }
}

/**
 * Cập nhật quyền người dùng (USER <-> ADMIN)
 */
export async function updateUserRole(id: number | string, newRole: "USER" | "ADMIN") {
  const numId = Number(id);
  if (isNaN(numId)) return null;

  return await prisma.user.update({
    where: { id: numId },
    data: { role: newRole },
  });
}
