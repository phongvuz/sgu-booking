import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

export const runtime = "nodejs";
const schema = z.object({
  identifier: z.string().trim().min(1).max(191),
  password: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ message: "Dữ liệu đăng nhập không hợp lệ!" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Vui lòng nhập email hoặc số điện thoại và mật khẩu hợp lệ!" }, { status: 400 });
  const { identifier, password } = parsed.data;
  try {
    const customer = await prisma.customer.findUnique({
      where: identifier.includes("@") ? { email: identifier.toLowerCase() } : { phone: identifier },
      select: { phone: true, status: true },
    });
    const user = customer ? await prisma.user.findUnique({ where: { phone: customer.phone } }) : null;
    // Spend the same password hashing work for unknown accounts.
    const dummy = `scrypt:${"0".repeat(32)}:${"0".repeat(128)}`;
    const validPassword = await verifyPassword(password, user?.password ?? dummy);
    if (!user || !customer || !validPassword || user.role !== "CUSTOMER" || customer.status !== "Đang hoạt động") {
      return NextResponse.json({ message: "Thông tin đăng nhập không đúng hoặc tài khoản không được phép đăng nhập!" }, { status: 401 });
    }
    const response = NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set(SESSION_COOKIE, createSessionToken(user.id), sessionCookieOptions);
    return response;
  } catch {
    return NextResponse.json({ message: "Không thể đăng nhập lúc này. Vui lòng thử lại sau!" }, { status: 500 });
  }
}
