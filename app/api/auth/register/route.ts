import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validations/register";
import { nextCustomerId } from "@/lib/customer-id";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Dữ liệu đăng ký không hợp lệ!" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 });
  }

  const { fullName, email, phone, address, password } = parsed.data;
  try {
    const [existingUser, existingCustomer] = await Promise.all([
      prisma.user.findUnique({ where: { phone }, select: { id: true } }),
      prisma.customer.findFirst({ where: { OR: [{ email }, { phone }] }, select: { id: true } }),
    ]);
    if (existingUser || existingCustomer) {
      return Response.json({ success: false, message: "Email hoặc số điện thoại đã được đăng ký!" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    // Retry deadlocks/serialization conflicts when registrations allocate the same ID.
    for (let attempt = 0; ; attempt++) {
      try {
        await prisma.$transaction(async (tx) => {
          const id = await nextCustomerId(tx);
          await tx.user.create({
            data: { fullName, phone, password: passwordHash, role: "CUSTOMER" },
            select: { id: true },
          });
          await tx.customer.create({
            data: { id, name: fullName, email, phone, address: address || null },
            select: { id: true },
          });
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
        break;
      } catch (error) {
        const retryable = error instanceof Prisma.PrismaClientKnownRequestError &&
          (error.code === "P2034" || (error.code === "P2002" &&
            (error.meta?.target === "PRIMARY" ||
              (Array.isArray(error.meta?.target) && error.meta.target.includes("id")))));
        if (!retryable || attempt >= 4) throw error;
      }
    }

    return Response.json({ success: true, message: "Đăng ký tài khoản thành công!" }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ success: false, message: "Email hoặc số điện thoại đã được đăng ký!" }, { status: 409 });
    }
    return Response.json({ success: false, message: "Không thể đăng ký lúc này. Vui lòng thử lại sau!" }, { status: 500 });
  }
}
