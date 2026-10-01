import { NextRequest, NextResponse } from "next/server";
import {
  createBooking,
  getBookings,
  BookingConflictError,
  TripNotFoundError,
} from "@/services/bookingService";

// POST /api/bookings - Controller tiếp nhận yêu cầu đặt vé
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tripId, seats, fullName, phone } = body;

    // 1. Validation tầng Controller
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

    // 2. Gọi tầng Service xử lý nghiệp vụ đặt vé
    const bookingResult = await createBooking({
      tripId,
      seats,
      fullName,
      phone,
    });

    // 3. Đóng gói kết quả trả về HTTP 201 Created
    return NextResponse.json(
      {
        success: true,
        message: "Đặt vé thành công và đã lưu vào cơ sở dữ liệu!",
        data: bookingResult,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Lỗi khi xử lý đặt vé:", error);

    if (error instanceof TripNotFoundError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 404 }
      );
    }

    if (error instanceof BookingConflictError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi xử lý đặt vé." },
      { status: 500 }
    );
  }
}

// GET /api/bookings - Controller tra cứu danh sách vé
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim() || "";
    const phone = searchParams.get("phone")?.trim() || "";

    const bookings = await getBookings({ query, phone });

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
