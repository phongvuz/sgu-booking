import { NextRequest, NextResponse } from "next/server";
import { getEmployeeById, updateEmployeeStatus } from "@/lib/employee-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ParamsContext = {
  params: Promise<{ id: string }>;
};

// PATCH /api/employees/[id]/status - Cập nhật trạng thái làm việc của nhân viên
export async function PATCH(request: NextRequest, { params }: ParamsContext) {
  try {
    const { id } = await params;
    const employee = await getEmployeeById(id);

    if (!employee) {
      return NextResponse.json(
        { success: false, message: `Không tìm thấy nhân viên có mã ${id}` },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status } = body;

    const allowedStatuses = ["Đang làm việc", "Nghỉ phép", "Đã nghỉ việc"];
    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: `Trạng thái không hợp lệ. Cho phép: ${allowedStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const updated = await updateEmployeeStatus(id, status);

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật trạng thái của "${employee.name}" thành "${status}"!`,
      data: updated,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái nhân viên:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi cập nhật trạng thái." },
      { status: 500 }
    );
  }
}
