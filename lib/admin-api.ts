import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { BusinessError, hasDatabaseCode } from "@/lib/business-error";

const REVIEW_ADMIN = {
  id: 0,
  fullName: "Reviewer",
  phone: "Không cần đăng nhập",
  role: "ADMIN",
  isActive: true,
};

export async function requireAdmin(request?: Request) {
  let admin = await getCurrentAdmin();
  const isMutation = request && !["GET", "HEAD"].includes(request.method);

  // Tạm mở trang quản trị để review. Với thao tác ghi, dùng một admin thật làm
  // người thực hiện nếu database đã có tài khoản quản trị.
  if (!admin && isMutation) {
    admin = await prisma.user.findFirst({
      where: { role: "ADMIN", isActive: true },
      select: { id: true, fullName: true, phone: true, role: true, isActive: true },
      orderBy: { id: "asc" },
    });
  }
  // Cookie đăng nhập không được dùng để sửa dữ liệu từ một website khác.
  const origin = request?.headers.get("origin");
  if (isMutation && origin && origin !== new URL(request.url).origin) {
    throw new BusinessError("Nguồn yêu cầu không hợp lệ.", 403);
  }
  return admin ?? REVIEW_ADMIN;
}

export async function readJson(request: Request): Promise<unknown> {
  try { return await request.json(); }
  catch { throw new BusinessError("Dữ liệu JSON không hợp lệ."); }
}

export function apiError(error: unknown, fallback: string) {
  if (error instanceof BusinessError) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status });
  }
  if (hasDatabaseCode(error, "P2002")) {
    return NextResponse.json({ success: false, message: "Dữ liệu bị trùng. Vui lòng kiểm tra lại thông tin hoặc ghế đã chọn." }, { status: 409 });
  }
  if (hasDatabaseCode(error, "P2003")) {
    return NextResponse.json({ success: false, message: "Dữ liệu đang được sử dụng. Không thể xóa lịch sử liên quan." }, { status: 409 });
  }
  if (hasDatabaseCode(error, "P2025")) {
    return NextResponse.json({ success: false, message: "Dữ liệu không còn tồn tại." }, { status: 404 });
  }
  if (hasDatabaseCode(error, "P2034")) {
    return NextResponse.json({ success: false, message: "Dữ liệu vừa thay đổi. Vui lòng tải lại và thử lại." }, { status: 409 });
  }
  console.error(fallback, error);
  return NextResponse.json({ success: false, message: fallback }, { status: 500 });
}
