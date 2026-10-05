import { prisma } from "@/lib/prisma";

export async function getActiveSeatHolds(tripId: number) {
  const now = new Date();
  return await prisma.seatHold.findMany({
    where: {
      tripId,
      expiresAt: { gt: now },
    },
    select: {
      seatNumber: true,
      clientId: true,
    },
  });
}

export async function holdSeat(tripId: number, seatNumber: string, clientId: string) {
  return await prisma.$transaction(async (tx) => {
    // Check if already booked
    const existingBooking = await tx.booking.findFirst({
      where: {
        tripId,
        seatNumber: seatNumber,
        status: { not: "CANCELLED" },
      },
    });
    if (existingBooking) throw new Error("Seat already booked");

    // Check if held by someone else and not expired
    const now = new Date();
    
    // Đếm số ghế mà user (clientId) đang giữ
    // Tại sao cần: Đảm bảo user không thể vượt quá giới hạn 3 ghế bằng cách gọi API trực tiếp
    // Dữ liệu vào: tripId và clientId. Ra: Số lượng (number) ghế đang được giữ
    // Syntax mới: tx.seatHold.count() dùng để đếm số bản ghi thỏa điều kiện
    const currentHolds = await tx.seatHold.count({
      where: { tripId, clientId, expiresAt: { gt: now } }
    });

    // Tìm xem ghế này đã có ai giữ chưa
    const existingHold = await tx.seatHold.findUnique({
      where: { tripId_seatNumber: { tripId, seatNumber } },
    });

    if (existingHold) {
      const isHeldBySomeoneElse = existingHold.clientId !== clientId;
      const isHoldActive = existingHold.expiresAt > now;

      if (isHeldBySomeoneElse && isHoldActive) {
        throw new Error("Seat is currently held by someone else");
      }
      
      // Nếu user đang lấy một ghế (đã hết hạn) của người khác, nghĩa là số ghế của user sẽ tăng thêm 1
      if (isHeldBySomeoneElse && currentHolds >= 3) {
        throw new Error("Bạn chỉ được giữ tối đa 3 ghế");
      }

      // Cập nhật lại thời gian giữ ghế thành 5 phút nữa
      return await tx.seatHold.update({
        where: { id: existingHold.id },
        data: { clientId, expiresAt: new Date(now.getTime() + 5 * 60000) },
      });
    } else {
      // Nếu ghế hoàn toàn mới (chưa ai giữ bao giờ)
      if (currentHolds >= 3) {
         throw new Error("Bạn chỉ được giữ tối đa 3 ghế");
      }

      return await tx.seatHold.create({
        data: {
          tripId,
          seatNumber,
          clientId,
          expiresAt: new Date(now.getTime() + 5 * 60000),
        },
      });
    }
  });
}

export async function releaseSeat(tripId: number, seatNumber: string, clientId: string) {
  return await prisma.seatHold.deleteMany({
    where: { tripId, seatNumber, clientId },
  });
}
