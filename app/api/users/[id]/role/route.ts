import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUserRole } from "@/services/userService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ParamsContext = {
  params: Promise<{ id: string }>;
};

// PATCH /api/users/[id]/role - Chuyển đổi vai trò người dùng (USER <-> ADMIN)
export async function PATCH(request: NextRequest, { params }: ParamsContext) {
  try {
    const { id } = await params;
    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: `Không tìm thấy người dùng có mã ${id}` },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { role } = body;

    if (role !== "USER" && role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Vai trò chỉ được là 'USER' hoặc 'ADMIN'" },
        { status: 400 }
      );
    }

    const updated = await updateUserRole(user.id, role);

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật quyền của "${user.fullName}" thành "${role}"!`,
      data: updated,
    });
  } catch (error) {
    console.error("Lỗi khi đổi quyền người dùng:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi cập nhật quyền." },
      { status: 500 }
    );
  }
}
