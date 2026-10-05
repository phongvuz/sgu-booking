import { prisma } from "@/lib/prisma";
import { Bus, BusQueryParams, PaginationMeta, BusStats } from "@/types";
import { BusFormValues } from "@/lib/validations/bus";

/**
 * Lấy danh sách xe với bộ lọc tìm kiếm, loại xe, trạng thái và phân trang
 */
export async function queryBuses(params: BusQueryParams): Promise<{
  data: Bus[];
  pagination: PaginationMeta;
  stats: BusStats;
}> {
  const {
    search = "",
    type = "",
    status = "",
    page = 1,
    limit = 8,
    sortBy = "id",
    sortOrder = "desc",
  } = params;

  const where: any = {};

  if (search.trim()) {
    const s = search.trim();
    where.OR = [
      { plate: { contains: s } },
      { id: { contains: s } },
      { brand: { contains: s } },
      { driverName: { contains: s } },
      { driverPhone: { contains: s } },
    ];
  }

  if (type) {
    where.type = type;
  }

  if (status) {
    where.status = status;
  }

  const numLimit = Math.max(1, Number(limit) || 8);
  const numPage = Math.max(1, Number(page) || 1);

  const [total, allBuses] = await Promise.all([
    prisma.bus.count({ where }),
    prisma.bus.findMany({ select: { status: true } }),
  ]);

  const stats: BusStats = {
    total: allBuses.length,
    active: allBuses.filter((b) => b.status === "Đang hoạt động").length,
    maintenance: allBuses.filter((b) => b.status === "Bảo dưỡng").length,
    inactive: allBuses.filter((b) => b.status === "Ngừng hoạt động").length,
  };

  const totalPages = Math.ceil(total / numLimit) || 1;
  const validPage = Math.min(numPage, totalPages);
  const skip = (validPage - 1) * numLimit;

  let orderBy: any = {};
  if (sortBy === "plate" || sortBy === "seats" || sortBy === "createdAt") {
    orderBy[sortBy] = sortOrder === "asc" ? "asc" : "desc";
  } else {
    orderBy = { id: "desc" };
  }

  const buses = await prisma.bus.findMany({
    where,
    orderBy,
    skip,
    take: numLimit,
  });

  const data: Bus[] = buses.map((b) => ({
    id: b.id,
    plate: b.plate,
    type: b.type,
    seats: b.seats,
    status: b.status,
    brand: b.brand || undefined,
    year: b.year || undefined,
    driverName: b.driverName || undefined,
    driverPhone: b.driverPhone || undefined,
    lastMaintenance: b.lastMaintenance || undefined,
    notes: b.notes || undefined,
    createdAt: b.createdAt.toISOString(),
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
 * Lấy chi tiết xe theo mã xe (ID) hoặc Biển số
 */
export async function getBusById(id: string): Promise<Bus | null> {
  const bus = await prisma.bus.findFirst({
    where: {
      OR: [{ id }, { plate: id }],
    },
  });

  if (!bus) return null;

  return {
    id: bus.id,
    plate: bus.plate,
    type: bus.type,
    seats: bus.seats,
    status: bus.status,
    brand: bus.brand || undefined,
    year: bus.year || undefined,
    driverName: bus.driverName || undefined,
    driverPhone: bus.driverPhone || undefined,
    lastMaintenance: bus.lastMaintenance || undefined,
    notes: bus.notes || undefined,
    createdAt: bus.createdAt.toISOString(),
  };
}

/**
 * Kiểm tra biển số xe có bị trùng không
 */
export async function checkBusPlateConflict(plate: string, excludeId?: string): Promise<boolean> {
  const existing = await prisma.bus.findFirst({
    where: {
      plate: plate.trim().toUpperCase(),
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });
  return !!existing;
}

/**
 * Thêm mới xe vào cơ sở dữ liệu
 */
export async function createBus(data: BusFormValues): Promise<Bus> {
  const allBuses = await prisma.bus.findMany({ select: { id: true } });
  const existingNums = allBuses
    .map((b) => {
      const match = b.id.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    })
    .filter((n) => !isNaN(n));

  const nextNum = (existingNums.length > 0 ? Math.max(...existingNums) : 0) + 1;
  const nextId = `BUS-${String(nextNum).padStart(3, "0")}`;

  const created = await prisma.bus.create({
    data: {
      id: nextId,
      plate: data.plate.trim().toUpperCase(),
      type: data.type.trim(),
      seats: Number(data.seats),
      status: data.status,
      brand: data.brand?.trim() || null,
      year: data.year ? Number(data.year) : null,
      driverName: data.driverName?.trim() || null,
      driverPhone: data.driverPhone?.trim() || null,
      lastMaintenance: data.lastMaintenance?.trim() || null,
      notes: data.notes?.trim() || null,
    },
  });

  return {
    id: created.id,
    plate: created.plate,
    type: created.type,
    seats: created.seats,
    status: created.status,
    brand: created.brand || undefined,
    year: created.year || undefined,
    driverName: created.driverName || undefined,
    driverPhone: created.driverPhone || undefined,
    lastMaintenance: created.lastMaintenance || undefined,
    notes: created.notes || undefined,
    createdAt: created.createdAt.toISOString(),
  };
}

/**
 * Cập nhật thông tin xe
 */
export async function updateBus(id: string, data: Partial<BusFormValues>): Promise<Bus | null> {
  const bus = await getBusById(id);
  if (!bus) return null;

  const updateData: any = {};
  if (data.plate !== undefined) updateData.plate = data.plate.trim().toUpperCase();
  if (data.type !== undefined) updateData.type = data.type.trim();
  if (data.seats !== undefined) updateData.seats = Number(data.seats);
  if (data.status !== undefined) updateData.status = data.status;
  if (data.brand !== undefined) updateData.brand = data.brand?.trim() || null;
  if (data.year !== undefined) updateData.year = data.year ? Number(data.year) : null;
  if (data.driverName !== undefined) updateData.driverName = data.driverName?.trim() || null;
  if (data.driverPhone !== undefined) updateData.driverPhone = data.driverPhone?.trim() || null;
  if (data.lastMaintenance !== undefined) updateData.lastMaintenance = data.lastMaintenance?.trim() || null;
  if (data.notes !== undefined) updateData.notes = data.notes?.trim() || null;

  const updated = await prisma.bus.update({
    where: { id: bus.id },
    data: updateData,
  });

  return {
    id: updated.id,
    plate: updated.plate,
    type: updated.type,
    seats: updated.seats,
    status: updated.status,
    brand: updated.brand || undefined,
    year: updated.year || undefined,
    driverName: updated.driverName || undefined,
    driverPhone: updated.driverPhone || undefined,
    lastMaintenance: updated.lastMaintenance || undefined,
    notes: updated.notes || undefined,
    createdAt: updated.createdAt.toISOString(),
  };
}

/**
 * Xóa một xe
 */
export async function deleteBus(id: string): Promise<boolean> {
  const bus = await getBusById(id);
  if (!bus) return false;

  try {
    await prisma.bus.delete({
      where: { id: bus.id },
    });
    return true;
  } catch (err) {
    console.error("Error deleting bus:", err);
    return false;
  }
}

/**
 * Cập nhật nhanh trạng thái xe
 */
export async function updateBusStatus(id: string, newStatus: string): Promise<Bus | null> {
  const bus = await getBusById(id);
  if (!bus) return null;

  const updated = await prisma.bus.update({
    where: { id: bus.id },
    data: { status: newStatus },
  });

  return {
    id: updated.id,
    plate: updated.plate,
    type: updated.type,
    seats: updated.seats,
    status: updated.status,
    brand: updated.brand || undefined,
    year: updated.year || undefined,
    driverName: updated.driverName || undefined,
    driverPhone: updated.driverPhone || undefined,
    lastMaintenance: updated.lastMaintenance || undefined,
    notes: updated.notes || undefined,
    createdAt: updated.createdAt.toISOString(),
  };
}
