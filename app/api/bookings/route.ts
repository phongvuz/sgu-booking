import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/bookings - Đặt vé xe và lưu trực tiếp vào MySQL database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tripId, seats, fullName, phone } = body;

    // Validation
    if (!tripId) {
      return NextResponse.json(
        { success: false, message: "Thiếu mã chuyến xe (tripId)." },
        { status: 400 }
      );
    }

    if (!Array.isArray(seats) || seats.length === 0) {
      return NextResponse.json(
        { success: false, message: "Vui lòng chọn ít nhất 1 ghế." },
        { status: 400 }
      );
    }

    if (!fullName?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập đầy đủ họ tên và số điện thoại." },
        { status: 400 }
      );
    }

    const numTripId = Number(tripId);
    const trip = await prisma.trip.findFirst({
      where: {
        OR: [
          ...(!isNaN(numTripId) ? [{ id: numTripId }] : []),
          { code: String(tripId) },
        ],
      },
      include: {
        bookings: true,
      },
    });

    if (!trip) {
      return NextResponse.json(
        { success: false, message: `Không tìm thấy chuyến xe với ID: ${tripId}` },
        { status: 404 }
      );
    }

    // Kiểm tra ghế đã có người đặt chưa
    const alreadyBookedList = trip.bookings
      .filter((b) => b.status !== "CANCELLED")
      .map((b) => b.seatNumber.toUpperCase().trim());

    const conflictingSeats = seats.filter((seat: string) => {
      const s = seat.toUpperCase().trim();
      return alreadyBookedList.includes(s);
    });

    if (conflictingSeats.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Ghế ${conflictingSeats.join(", ")} đã được người khác đặt trước đó. Vui lòng chọn ghế khác.`,
        },
        { status: 409 }
      );
    }

    // Tìm hoặc tạo người dùng theo số điện thoại
    const trimmedPhone = phone.trim();
    const trimmedName = fullName.trim();

    let user = await prisma.user.findFirst({
      where: { phone: trimmedPhone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          fullName: trimmedName,
          phone: trimmedPhone,
          password: "guest_password",
          role: "USER",
        },
      });
    }

    // Tạo các bản ghi Booking trong MySQL
    const createdBookings = await prisma.$transaction(async (tx) => {
      const bookings = [];
      for (const seat of seats) {
        const b = await tx.booking.create({
          data: {
            seatNumber: String(seat).trim(),
            status: "CONFIRMED",
            totalPrice: trip.price,
            userId: user.id,
            tripId: trip.id,
          },
        });
        bookings.push(b);
      }

      // Cập nhật số ghế trống còn lại trong chuyến xe
      const newAvailable = Math.max(0, trip.availableSeats - seats.length);
      await tx.trip.update({
        where: { id: trip.id },
        data: { availableSeats: newAvailable },
      });

      return bookings;
    });

    const pnrCode = `NHAXE-${trip.code}-${user.id}${createdBookings[0].id}`;

    return NextResponse.json(
      {
        success: true,
        message: "Đặt vé thành công và đã lưu vào cơ sở dữ liệu!",
        data: {
          pnr: pnrCode,
          tripCode: trip.code,
          tripId: trip.id,
          passenger: {
            name: user.fullName,
            phone: user.phone,
          },
          seats,
          totalPrice: trip.price * seats.length,
          bookingIds: createdBookings.map((b) => b.id),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Lỗi khi xử lý đặt vé:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi xử lý đặt vé." },
      { status: 500 }
    );
  }
}

// GET /api/bookings - Tra cứu vé thật từ MySQL Database (theo phone, pnr, hoặc tripId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim() || "";
    const phone = searchParams.get("phone")?.trim() || "";

    const targetPhone = phone || query;

    if (!targetPhone) {
      // Trả về danh sách đơn gần nhất
      const bookings = await prisma.booking.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
        include: {
          trip: true,
          user: true,
        },
      });
      return NextResponse.json({ success: true, data: bookings });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { user: { phone: { contains: targetPhone } } },
          { user: { fullName: { contains: targetPhone } } },
          ...(!isNaN(Number(targetPhone)) ? [{ id: Number(targetPhone) }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        trip: true,
        user: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Lỗi khi tra cứu đặt vé:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi tra cứu vé." },
      { status: 500 }
    );
  }
}
