import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { runTransaction } from "@/lib/transaction";
import { BusinessError } from "@/lib/business-error";
import { createVietqrUrl, getVietqrConfig, isPaymentDemoEnabled } from "@/lib/vietqr";
import type { VietqrPaymentInfo } from "@/types/payment";

export async function getVietqrPaymentInfo(pnr: string): Promise<VietqrPaymentInfo> {
  const bookings = await prisma.booking.findMany({ where: { pnr }, orderBy: { id: "asc" } });
  if (!bookings.length) throw new BusinessError("Không tìm thấy mã đặt chỗ.", 404);
  const config = getVietqrConfig();
  const total_amount = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
  // Một lượt có nhiều vé: dùng ID vé đầu tiên làm mã đơn hàng ngắn, duy nhất.
  const order_code = `VE${bookings[0].id}`;
  return { bankName: config.bankName, accountNo: config.accountNo, accountName: config.accountName,
    total_amount, order_code, qrUrl: createVietqrUrl(total_amount, order_code) };
}

export async function getPaymentStatus(pnr: string) {
  const [bookings, payment] = await Promise.all([
    prisma.booking.findMany({ where: { pnr }, select: { status: true } }),
    prisma.payment.findFirst({ where: { pnr, status: { in: ["SUCCESS", "REVIEW"] } }, orderBy: { createdAt: "desc" } }),
  ]);
  if (!bookings.length) throw new BusinessError("Không tìm thấy mã đặt chỗ.", 404);
  return { status: payment?.status ?? "NONE", bookingStatus: bookings.every((b) => b.status === "CONFIRMED") ? "CONFIRMED" : bookings.every((b) => b.status === "PENDING") ? "PENDING" : "UNAVAILABLE" };
}

// DEMO: giả lập nhận tiền, không gọi ngân hàng và không kiểm tra số dư.
export async function confirmDemoPayment(pnr: string) {
  if (!isPaymentDemoEnabled()) throw new BusinessError("Chế độ xác nhận thanh toán demo đang tắt.", 403);
  getVietqrConfig();
  return runTransaction(async (tx) => {
    const bookings = await tx.booking.findMany({ where: { pnr }, include: { trip: true }, orderBy: { id: "asc" } });
    if (!bookings.length) throw new BusinessError("Không tìm thấy mã đặt chỗ.", 404);
    const received = await tx.payment.findFirst({ where: { pnr, status: { in: ["SUCCESS", "REVIEW"] } } });
    if (received) {
      if (received.status === "SUCCESS" && bookings.every((b) => b.status === "CONFIRMED")) {
        return { status: "SUCCESS", bookingStatus: "CONFIRMED" }; // Bấm lại: không tạo record mới.
      }
      throw new BusinessError("Lượt đặt chỗ đã có thanh toán. Vui lòng liên hệ nhà xe để đối soát.", 409);
    }
    if (bookings.some((b) => b.status !== "PENDING" || b.trip.time <= new Date())) {
      throw new BusinessError("Chỉ xác nhận được lượt đặt chỗ đang chờ thanh toán và chưa xuất bến.", 409);
    }
    // Backend tự tính tiền, không nhận giá hoặc trạng thái từ trình duyệt.
    const amount = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    const orderCode = `VE${bookings[0].id}`;
    const qrUrl = createVietqrUrl(amount, orderCode);
    const paidAt = new Date();
    const id = randomBytes(16).toString("hex");
    await tx.payment.create({ data: {
      id, pnr, amount, status: "SUCCESS", responseCode: "DEMO",
      providerTransactionId: `DEMO-${id}`, checkoutUrl: qrUrl,
      createdAt: paidAt, paidAt, expiresAt: bookings[0].trip.time,
    } });
    await tx.booking.updateMany({ where: { pnr, status: "PENDING" }, data: { status: "CONFIRMED", confirmedAt: paidAt } });
    // Ghế đã trừ khi đặt vé nên không trừ lần nữa khi thanh toán.
    return { status: "SUCCESS", bookingStatus: "CONFIRMED" };
  });
}
