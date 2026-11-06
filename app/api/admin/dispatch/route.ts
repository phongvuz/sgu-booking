import { requireAdmin, apiError } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const [buses, drivers] = await Promise.all([
      prisma.bus.findMany({ select: { id: true, plate: true, seats: true, status: true }, orderBy: { plate: "asc" } }),
      prisma.employee.findMany({ where: { role: "Tài xế" }, select: { id: true, name: true, status: true }, orderBy: { name: "asc" } }),
    ]);
    return Response.json({ success: true, data: { buses, drivers } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error, "Không thể tải danh sách xe và tài xế.");
  }
}
