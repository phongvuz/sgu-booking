import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/session";
import { hashPassword, verifyPassword } from "@/lib/password";
import { profileSchema, passwordSchema } from "@/lib/validations/profile";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  if (request.headers.get("origin") && request.headers.get("origin") !== new URL(request.url).origin) {
    return Response.json({ message: "Yêu cầu không hợp lệ!" }, { status: 403 });
  }
  try {
    const customer = await getCurrentCustomer();
    if (!customer) return Response.json({ message: "Vui lòng đăng nhập để tiếp tục!" }, { status: 401 });
    let body;
    try { body = await request.json(); } catch {
      return Response.json({ message: "Dữ liệu không hợp lệ!" }, { status: 400 });
    }
    if (body?.action === "password") {
      const parsed = passwordSchema.safeParse(body);
      if (!parsed.success) return Response.json({ message: parsed.error.issues[0].message }, { status: 400 });
      const user = await prisma.user.findUnique({ where: { id: customer.userId }, select: { password: true } });
      if (!user || !await verifyPassword(parsed.data.currentPassword, user.password)) {
        return Response.json({ message: "Mật khẩu hiện tại không đúng!" }, { status: 400 });
      }
      const password = await hashPassword(parsed.data.password);
      const updated = await prisma.user.updateMany({
        where: { id: customer.userId, password: user.password, role: "CUSTOMER" }, data: { password },
      });
      if (!updated.count) return Response.json({ message: "Thông tin đã thay đổi. Vui lòng thử lại!" }, { status: 409 });
      return Response.json({ message: "Đổi mật khẩu thành công!" });
    }
    if (body?.action !== "profile") return Response.json({ message: "Yêu cầu không hợp lệ!" }, { status: 400 });
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) return Response.json({ message: parsed.error.issues[0].message }, { status: 400 });
    const { fullName, email, phone, address } = parsed.data;
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: customer.userId }, data: { fullName, phone } });
      await tx.customer.update({ where: { id: customer.customerId }, data: { name: fullName, email, phone, address: address || null } });
    });
    return Response.json({ message: "Cập nhật thông tin thành công!" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ message: "Email hoặc số điện thoại đã được sử dụng!" }, { status: 409 });
    }
    return Response.json({ message: "Không thể cập nhật lúc này. Vui lòng thử lại sau!" }, { status: 500 });
  }
}
