import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser, deleteUser, checkUserPhoneConflict } from "@/services/userService";
import { userSchema } from "@/lib/validations/user";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ParamsContext = {
  params: Promise<{ id: string }>;
};

// GET /api/users/[id] - Lấy chi tiết tài khoản kèm lịch sử vé
export async function GET(request: NextRequest, { params }: ParamsContext) {
  try {
    const { id } = await params;
    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: `Không tìm thấy người dùng có mã ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Lỗi khi tìm người dùng:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi tìm người dùng." },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Cập nhật thông tin người dùng
export async function PUT(request: NextRequest, { params }: ParamsContext) {
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

    const validationResult = userSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues
        .map((i) => i.message)
        .join(", ");
      return NextResponse.json(
        {
          success: false,
          message: errorMessage || "Dữ liệu cập nhật không hợp lệ",
          errors: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const validData = validationResult.data;

    // Check phone conflict
    const phoneConflict = await checkUserPhoneConflict(validData.phone, user.id);
    if (phoneConflict) {
      return NextResponse.json(
        {
          success: false,
          message: `Số điện thoại "${validData.phone}" đã được sử dụng bởi người dùng khác.`,
        },
        { status: 409 }
      );
    }

    const updated = await updateUser(user.id, validData);

    return NextResponse.json({
      success: true,
      message: `Cập nhật thông tin tài khoản "${updated?.fullName}" thành công!`,
      data: updated,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật người dùng:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi cập nhật người dùng." },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Xóa tài khoản người dùng
export async function DELETE(request: NextRequest, { params }: ParamsContext) {
  try {
    const { id } = await params;
    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: `Không tìm thấy người dùng có mã ${id}` },
        { status: 404 }
      );
    }

    const deleted = await deleteUser(user.id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: `Không thể xóa người dùng mã ${id}.` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Đã xóa tài khoản "${user.fullName}" thành công!`,
    });
  } catch (error) {
    console.error("Lỗi khi xóa người dùng:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi xóa người dùng." },
      { status: 500 }
    );
  }
}
