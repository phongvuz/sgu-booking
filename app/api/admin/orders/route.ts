import { NextRequest, NextResponse } from "next/server";
import { queryOrdersAdmin, createBooking } from "@/services/bookingService";
import { offlineOrderSchema } from "@/lib/validations/order";
import { OrderQueryParams } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/admin/orders - Danh sách đơn hàng / vé xe phân trang cho admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params: OrderQueryParams = {
      search: searchParams.get("search") || "",
      status: searchParams.get("status") || "",
      date: searchParams.get("date") || "",
      tripId: searchParams.get("tripId") || "",
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 8,
      sortBy: (searchParams.get("sortBy") as any) || "id",
      sortOrder: (searchParams.get("sortOrder") as any) || "desc",
    };

    const result = await queryOrdersAdmin(params);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      stats: result.stats,
      message: "Lấy danh sách đơn hàng thành công",
    });
  } catch (error) {
    console.error("Lỗi khi tải danh sách đơn vé:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi tải danh sách đơn vé" },
      { status: 500 }
    );
  }
}

// POST /api/admin/orders - Tạo đơn vé mới trực tiếp tại quầy (Offline)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = offlineOrderSchema.safeParse(body);
    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const errorMessage = issues.map((i) => i.message).join(", ");
      return NextResponse.json(
        {
          success: false,
          message: errorMessage || "Thông tin đặt vé không hợp lệ",
          errors: issues,
        },
        { status: 400 }
      );
    }

    const { tripId, seats, fullName, phone, status } = validationResult.data;

    const bookingResult = await createBooking({
      tripId,
      seats,
      fullName,
      phone,
      status: status as any,
    });

    return NextResponse.json(
      {
        success: true,
        data: bookingResult,
        message: `Đã tạo vé thành công! Mã vé (PNR): ${bookingResult.pnr}`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Lỗi khi tạo vé offline:", error);
    const isConflict = error.name === "BookingConflictError";
    const isNotFound = error.name === "TripNotFoundError";

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Lỗi máy chủ khi tạo đơn vé.",
      },
      { status: isConflict ? 409 : isNotFound ? 404 : 500 }
    );
  }
}
