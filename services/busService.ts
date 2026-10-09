import { randomBytes } from "node:crypto";
import { positiveInteger } from "@/lib/query-params";
import type { Prisma } from "@prisma/client";
import { toBus } from "@/lib/record-mappers";
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
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  const where: Prisma.busWhereInput = {};

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

  const numLimit = positiveInteger(limit, 8, 100);
  const numPage = positiveInteger(page, 1);

  const [total, statusCounts] = await Promise.all([
    prisma.bus.count({ where }),
    prisma.bus.groupBy({ by: ["status"], where, _count: { _all: true } }),
  ]);
  const countStatus = (status: string) => statusCounts.find((group) => group.status === status)?._count._all ?? 0;
  const stats: BusStats = {
    total: statusCounts.reduce((sum, group) => sum + group._count._all, 0),
    active: countStatus("Đang hoạt động"),
    maintenance: countStatus("Bảo dưỡng"),
    inactive: countStatus("Ngừng hoạt động"),
  };

  const totalPages = Math.ceil(total / numLimit) || 1;
  const validPage = Math.min(numPage, totalPages);
  const skip = (validPage - 1) * numLimit;

  let orderBy: Prisma.busOrderByWithRelationInput = {};
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

  const data: Bus[] = buses.map(toBus);

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

  return toBus(bus);
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
  const nextId = `BUS-${randomBytes(6).toString("hex").toUpperCase()}`;

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

  return toBus(created);
}

/**
 * Cập nhật thông tin xe
 */
export async function updateBus(id: string, data: Partial<BusFormValues>): Promise<Bus | null> {
  const bus = await getBusById(id);
  if (!bus) return null;

  const updateData: Prisma.busUpdateInput = {};
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

  return toBus(updated);
}

/**
 * Xóa một xe
 */
export async function deleteBus(id: string): Promise<boolean> {
  const bus = await getBusById(id);
  if (!bus) return false;

  await prisma.bus.delete({ where: { id: bus.id } });
  return true;
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

  return toBus(updated);
}
