import { requireAdmin, apiError, readJson } from "@/lib/admin-api";
import { getOrderById, updateOrderStatus, deleteOrder } from "@/services/orderService";
import { NextRequest, NextResponse } from "next/server";
import type { BookingStatus } from "@/types";
import { BusinessError } from "@/lib/business-error";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ParamsContext = {
  params: Promise<{ id: string }>;
};

function parseOrderId(value: string) {
  const id = Number(value);
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(id) || id <= 0 || id > 2147483647) {
    throw new BusinessError("ID đơn hàng phải là số nguyên dương hợp lệ.");
  }
  return id;
}

function notFoundResponse() {
  return NextResponse.json({ success: false, message: "Không tìm thấy đơn hàng." }, { status: 404 });
}

// READ: GET /api/admin/orders/[id]
export async function GET(request: NextRequest, { params }: ParamsContext) {
  try {
    await requireAdmin(request);
    const { id } = await params;

    const order = await getOrderById(parseOrderId(id));
    if (!order) return notFoundResponse();
    return NextResponse.json(
      { success: true, data: order, message: "Lấy chi tiết đơn hàng thành công." },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return apiError(error, "Không thể lấy chi tiết đơn hàng. Vui lòng thử lại.");
  }
}

// UPDATE: PATCH /api/admin/orders/[id]
export async function PATCH(request: NextRequest, { params }: ParamsContext) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const orderId = parseOrderId(id);
    const body = await readJson(request);
    let status: unknown;
    if (body && typeof body === "object" && "status" in body) {
      status = body.status;
    }
    const allowedStatuses: BookingStatus[] = ["CONFIRMED", "PENDING", "CANCELLED"];

    if (typeof status !== "string" || !allowedStatuses.includes(status as BookingStatus)) {
      return NextResponse.json(
        { success: false, message: `Trạng thái không hợp lệ. Cho phép: ${allowedStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const updated = await updateOrderStatus(orderId, status as BookingStatus);
    if (!updated) return notFoundResponse();
    return NextResponse.json(
      { success: true, data: updated, message: "Cập nhật trạng thái đơn hàng thành công." }
    );
  } catch (error) {
    return apiError(error, "Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.");
  }
}

// DELETE: DELETE /api/admin/orders/[id] (hủy vé và giữ lịch sử)
export async function DELETE(request: NextRequest, { params }: ParamsContext) {
  try {
    await requireAdmin(request);
    const { id } = await params;

    const deleted = await deleteOrder(parseOrderId(id));
    if (!deleted) return notFoundResponse();
    return NextResponse.json(
      { success: true, message: "Đã hủy vé và giữ lại lịch sử đơn hàng." }
    );
  } catch (error) {
    return apiError(error, "Không thể hủy đơn hàng. Vui lòng thử lại.");
  }
}
