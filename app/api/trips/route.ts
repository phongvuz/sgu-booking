import { NextRequest, NextResponse } from "next/server";
import { resolveLocationName } from "@/types";
import { getTrips, createTrip } from "@/services/tripService";

// GET /api/trips - Lấy danh sách chuyến xe (hỗ trợ lọc theo from, to, date)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get("from")?.trim() || "";
    const toParam = searchParams.get("to")?.trim() || "";
    const dateParam = searchParams.get("date")?.trim() || "";

    const fromCity = resolveLocationName(fromParam);
    const toCity = resolveLocationName(toParam);

    const trips = await getTrips({
      fromCity,
      toCity,
      date: dateParam || undefined,
      includeBookings: true,
    });

    return NextResponse.json({
      success: true,
      count: trips.length,
      data: trips,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách chuyến xe:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi tải danh sách chuyến xe." },
      { status: 500 }
    );
  }
}

// POST /api/trips - Tạo và lưu trữ một tuyến xe mới
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

    const newTrip = await createTrip({
      from,
      to,
      time,
      price: numPrice,
      availableSeats: Number(availableSeats ?? emptySeats ?? 30),
      code,
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
    console.error("Lỗi khi tạo tuyến xe:", error);
    const message = error instanceof Error ? error.message : "Lỗi hệ thống khi tạo tuyến xe.";
    const isConflict = message.includes("đã tồn tại");
    return NextResponse.json(
      { success: false, message },
      { status: isConflict ? 409 : 500 }
    );
  }
}
