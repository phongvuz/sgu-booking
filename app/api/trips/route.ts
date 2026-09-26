import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveLocationName } from "@/types";

// GET /api/trips - Lấy danh sách chuyến xe từ MySQL Database (hỗ trợ lọc theo from, to, date)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get("from")?.trim() || "";
    const toParam = searchParams.get("to")?.trim() || "";
    const dateParam = searchParams.get("date")?.trim() || "";

    const fromCity = resolveLocationName(fromParam);
    const toCity = resolveLocationName(toParam);

    let timeFilter = undefined;
    if (dateParam) {
      const parsedDate = new Date(dateParam);
      if (!isNaN(parsedDate.getTime())) {
        const startOfDay = new Date(parsedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(parsedDate);
        endOfDay.setHours(23, 59, 59, 999);
        timeFilter = {
          gte: startOfDay,
          lte: endOfDay,
        };
      }
    }

    const trips = await prisma.trip.findMany({
      where: {
        from: fromCity ? { contains: fromCity } : undefined,
        to: toCity ? { contains: toCity } : undefined,
        time: timeFilter,
      },
      orderBy: { time: "asc" },
      include: {
        bookings: {
          select: {
            id: true,
            seatNumber: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: trips.length,
      data: trips,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách chuyến xe từ database:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi tải danh sách chuyến xe." },
      { status: 500 }
    );
  }
}

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
