import { requireAdmin, apiError, readJson } from "@/lib/admin-api";
import { NextRequest, NextResponse } from "next/server";
import type { BookingStatus } from "@/types";

// Bài thực hành: docs/exercises/orders/README.md
export const dynamic = "force-dynamic";
export const revalidate = 0;

type ParamsContext = {
  params: Promise<{ id: string }>;
};

// READ: GET /api/admin/orders/[id]
export async function GET(request: NextRequest, { params }: ParamsContext) {
  try {
    await requireAdmin(request);
    const { id } = await params;

    // TODO R2: Kiểm tra id là số nguyên dương hợp lệ trước khi gọi service.
    // TODO R2: Gọi getOrderById(id) trong services/orderService.ts.
    // TODO R2: Không tìm thấy -> { success: false, message: ... }, HTTP 404.
    // TODO R2: Tìm thấy -> { success: true, data: order }, HTTP 200.
    return NextResponse.json(
      { success: false, message: `Bài R2: Bạn chưa viết API xem đơn hàng ${id}.` },
      { status: 501 }
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
    const body = await readJson(request);
    const status = body && typeof body === "object" && "status" in body
      ? body.status
      : undefined;
    const allowedStatuses: BookingStatus[] = ["CONFIRMED", "PENDING", "CANCELLED"];

    if (typeof status !== "string" || !allowedStatuses.includes(status as BookingStatus)) {
      return NextResponse.json(
        { success: false, message: `Trạng thái không hợp lệ. Cho phép: ${allowedStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // TODO U: Kiểm tra id; tìm đơn bằng getOrderById(id); trả 404 nếu không có.
    // TODO U: Gọi updateOrderStatus(id, status as BookingStatus).
    // TODO U: Nếu service trả null (đơn không còn tồn tại), trả 404.
    // TODO U: Trả { success: true, data: updated, message: ... }, HTTP 200.
    // Service giữ quy tắc thanh toán, thời gian xuất bến và số ghế; apiError xử lý lỗi.
    return NextResponse.json(
      { success: false, message: `Bài U: Bạn chưa viết API đổi trạng thái đơn hàng ${id}.` },
      { status: 501 }
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

    // TODO D: Kiểm tra id; tìm đơn bằng getOrderById(id); trả 404 nếu không có.
    // TODO D: Gọi deleteOrder(id) trong services/orderService.ts.
    // TODO D: Nếu service trả false (đơn không còn tồn tại), trả 404.
    // TODO D: Trả { success: true, message: ... }, HTTP 200.
    // deleteOrder chuyển vé sang CANCELLED, trả ghế đúng một lần và giữ lịch sử.
    return NextResponse.json(
      { success: false, message: `Bài D: Bạn chưa viết API hủy đơn hàng ${id}.` },
      { status: 501 }
    );
  } catch (error) {
    return apiError(error, "Không thể hủy đơn hàng. Vui lòng thử lại.");
  }
}