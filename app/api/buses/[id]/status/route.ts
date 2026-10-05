import { NextRequest, NextResponse } from "next/server";
import { getBusById, updateBusStatus } from "@/services/busService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ParamsContext = {
  params: Promise<{ id: string }>;
};

// PATCH /api/buses/[id]/status - Cập nhật trạng thái hoạt động của xe
export async function PATCH(request: NextRequest, { params }: ParamsContext) {
  try {
    const { id } = await params;
    const bus = await getBusById(id);

    if (!bus) {
      return NextResponse.json(
        { success: false, message: `Không tìm thấy xe có mã ${id}` },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status } = body;

    const allowedStatuses = ["Đang hoạt động", "Bảo dưỡng", "Ngừng hoạt động"];
    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: `Trạng thái không hợp lệ. Cho phép: ${allowedStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const updated = await updateBusStatus(bus.id, status);

    return NextResponse.json({
      success: true,
      message: `Đã chuyển trạng thái xe "${bus.plate}" sang "${status}"!`,
      data: updated,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái xe:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi cập nhật trạng thái xe." },
      { status: 500 }
    );
  }
}
