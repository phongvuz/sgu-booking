import { prisma } from "@/lib/prisma";
import { Employee, EmployeeQueryParams, PaginationMeta } from "@/types";

/**
 * Lấy danh sách nhân viên từ MySQL với bộ lọc, tìm kiếm và phân trang
 */
export async function queryEmployees(params: EmployeeQueryParams): Promise<{
  data: Employee[];
  pagination: PaginationMeta;
}> {
  const {
    search = "",
    role = "",
    department = "",
    status = "",
    page = 1,
    limit = 8,
    sortBy = "id",
    sortOrder = "desc",
  } = params;

  const where: any = {};

  // 1. Tìm kiếm theo tên, email, sđt, mã nhân viên
  if (search.trim()) {
    const s = search.trim();
    where.OR = [
      { name: { contains: s } },
      { email: { contains: s } },
      { phone: { contains: s } },
      { id: { contains: s } },
    ];
  }

  // 2. Lọc theo chức vụ
  if (role) {
    where.role = role;
  }

  // 3. Lọc theo phòng ban
  if (department) {
    where.department = department;
  }

  // 4. Lọc theo trạng thái
  if (status) {
    where.status = status;
  }

  const numLimit = Math.max(1, Number(limit) || 8);
  const numPage = Math.max(1, Number(page) || 1);

  const total = await prisma.employee.count({ where });
  const totalPages = Math.ceil(total / numLimit) || 1;
  const validPage = Math.min(numPage, totalPages);
  const skip = (validPage - 1) * numLimit;

  // 5. Sắp xếp
  let orderBy: any = {};
  if (sortBy === "name" || sortBy === "createdAt" || sortBy === "id") {
    orderBy[sortBy] = sortOrder === "asc" ? "asc" : "desc";
  } else {
    orderBy = { id: "desc" };
  }

  const employees = await prisma.employee.findMany({
    where,
    orderBy,
    skip,
    take: numLimit,
  });

  const data: Employee[] = employees.map((emp) => ({
    id: emp.id,
    name: emp.name,
    email: emp.email,
    phone: emp.phone,
    role: emp.role,
    department: emp.department,
    status: emp.status,
    avatar: emp.avatar || undefined,
    identityCard: emp.identityCard || undefined,
    address: emp.address || undefined,
    startDate: emp.startDate,
    createdAt: emp.createdAt.toISOString(),
  }));

  return {
    data,
    pagination: {
      page: validPage,
      limit: numLimit,
      total,
      totalPages,
    },
  };
}

/**
 * Tìm kiếm nhân viên theo mã ID
 */
export async function getEmployeeById(id: string): Promise<Employee | null> {
  const emp = await prisma.employee.findUnique({
    where: { id },
  });

  if (!emp) return null;

  return {
    id: emp.id,
    name: emp.name,
    email: emp.email,
    phone: emp.phone,
    role: emp.role,
    department: emp.department,
    status: emp.status,
    avatar: emp.avatar || undefined,
    identityCard: emp.identityCard || undefined,
    address: emp.address || undefined,
    startDate: emp.startDate,
    createdAt: emp.createdAt.toISOString(),
  };
}

/**
 * Thêm mới một nhân viên vào MySQL
 */
export async function createEmployee(data: {
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status?: string;
  avatar?: string;
  identityCard?: string;
  address?: string;
  startDate?: string;
}): Promise<Employee> {
  const allEmployees = await prisma.employee.findMany({
    select: { id: true },
  });

  const existingNums = allEmployees
    .map((e) => {
      const match = e.id.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    })
    .filter((n) => !isNaN(n));

  const nextNum = (existingNums.length > 0 ? Math.max(...existingNums) : 0) + 1;
  const nextId = `EMP-${String(nextNum).padStart(3, "0")}`;

  const now = new Date();

  const created = await prisma.employee.create({
    data: {
      id: nextId,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      role: data.role.trim(),
      department: data.department.trim(),
      status: data.status || "Đang làm việc",
      avatar:
        data.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          data.name
        )}&background=ef5222&color=fff&size=150`,
      identityCard: data.identityCard?.trim() || null,
      address: data.address?.trim() || null,
      startDate: data.startDate || now.toISOString().slice(0, 10),
      createdAt: now,
    },
  });

  return {
    id: created.id,
    name: created.name,
    email: created.email,
    phone: created.phone,
    role: created.role,
    department: created.department,
    status: created.status,
    avatar: created.avatar || undefined,
    identityCard: created.identityCard || undefined,
    address: created.address || undefined,
    startDate: created.startDate,
    createdAt: created.createdAt.toISOString(),
  };
}

/**
 * Cập nhật thông tin nhân viên
 */
export async function updateEmployee(
  id: string,
  data: Partial<Omit<Employee, "id" | "createdAt">>
): Promise<Employee | null> {
  const existing = await prisma.employee.findUnique({
    where: { id },
  });

  if (!existing) return null;

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.email !== undefined) updateData.email = data.email.trim().toLowerCase();
  if (data.phone !== undefined) updateData.phone = data.phone.trim();
  if (data.role !== undefined) updateData.role = data.role.trim();
  if (data.department !== undefined) updateData.department = data.department.trim();
  if (data.status !== undefined) updateData.status = data.status;
  if (data.avatar !== undefined) updateData.avatar = data.avatar;
  if (data.identityCard !== undefined) updateData.identityCard = data.identityCard?.trim() || null;
  if (data.address !== undefined) updateData.address = data.address?.trim() || null;
  if (data.startDate !== undefined) updateData.startDate = data.startDate;

  const updated = await prisma.employee.update({
    where: { id },
    data: updateData,
  });

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    role: updated.role,
    department: updated.department,
    status: updated.status,
    avatar: updated.avatar || undefined,
    identityCard: updated.identityCard || undefined,
    address: updated.address || undefined,
    startDate: updated.startDate,
    createdAt: updated.createdAt.toISOString(),
  };
}

/**
 * Xóa nhân viên theo mã ID
 */
export async function deleteEmployee(id: string): Promise<boolean> {
  try {
    await prisma.employee.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Cập nhật trạng thái làm việc của nhân viên
 */
export async function updateEmployeeStatus(
  id: string,
  newStatus: string
): Promise<Employee | null> {
  try {
    const updated = await prisma.employee.update({
      where: { id },
      data: { status: newStatus },
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
      department: updated.department,
      status: updated.status,
      avatar: updated.avatar || undefined,
      identityCard: updated.identityCard || undefined,
      address: updated.address || undefined,
      startDate: updated.startDate,
      createdAt: updated.createdAt.toISOString(),
    };
  } catch (error) {
    return null;
  }
}
