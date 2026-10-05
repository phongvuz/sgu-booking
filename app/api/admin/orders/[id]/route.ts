import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderStatus, deleteOrder } from "@/services/bookingService";
import { BookingStatus } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ParamsContext = {
  params: Promise<{ id: string }>;
};

// GET /api/admin/orders/[id] - Lấy chi tiết đơn vé
export async function GET(request: NextRequest, { params }: ParamsContext) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: `Không tìm thấy đơn hàng mã ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Lỗi khi tìm đơn vé:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi tìm đơn vé." },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/orders/[id] - Cập nhật trạng thái vé (CONFIRMED, PENDING, CANCELLED)
export async function PATCH(request: NextRequest, { params }: ParamsContext) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: `Không tìm thấy đơn hàng mã ${id}` },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status } = body;

    const allowedStatuses: BookingStatus[] = ["CONFIRMED", "PENDING", "CANCELLED"];
    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: `Trạng thái không hợp lệ. Cho phép: ${allowedStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const updated = await updateOrderStatus(id, status);

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật trạng thái đơn vé sang "${status}" thành công!`,
      data: updated,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái vé:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi cập nhật trạng thái vé." },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/orders/[id] - Hủy hoặc xóa đơn vé
export async function DELETE(request: NextRequest, { params }: ParamsContext) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: `Không tìm thấy đơn hàng mã ${id}` },
        { status: 404 }
      );
    }

    const deleted = await deleteOrder(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: `Không thể xóa đơn vé mã ${id}.` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Đã xóa đơn vé mã ${id} thành công!`,
    });
  } catch (error) {
    console.error("Lỗi khi xóa đơn vé:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi xóa đơn vé." },
      { status: 500 }
    );
  }
}
