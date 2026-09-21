import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/trips - Tạo và lưu trữ một tuyến xe mới vào MySQL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from, to, time, price, availableSeats, emptySeats, code } = body;

    // Validation
    if (!from || !to || !time || price === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng cung cấp đầy đủ thông tin: from, to, time, price.",
        },
        { status: 400 }
      );
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return NextResponse.json(
        { success: false, message: "Giá vé (price) phải là số dương hợp lệ." },
        { status: 400 }
      );
    }

    const seats = Number(availableSeats ?? emptySeats ?? 30);

    // Tự sinh mã chuyến nếu chưa có (VD: SG-DL-03)
    let tripCode = code?.trim();
    if (!tripCode) {
      const count = await prisma.trip.count();
      tripCode = `VN${String(count + 1).padStart(2, "0")}`;
    }

    // Kiểm tra trùng code
    const existing = await prisma.trip.findUnique({
      where: { code: tripCode },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: `Mã chuyến xe ${tripCode} đã tồn tại trong database.` },
        { status: 409 }
      );
    }

    const newTrip = await prisma.trip.create({
      data: {
        code: tripCode,
        from: from.trim(),
        to: to.trim(),
        time: new Date(time),
        price: numPrice,
        availableSeats: seats,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Tạo tuyến xe mới vào cơ sở dữ liệu thành công!",
        data: newTrip,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Lỗi khi tạo tuyến xe trong database:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi tạo tuyến xe." },
      { status: 500 }
    );
  }
}
