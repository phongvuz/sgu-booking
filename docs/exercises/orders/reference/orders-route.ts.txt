import { requireAdmin, apiError, readJson } from "@/lib/admin-api";
import { readOption } from "@/lib/query-params";
import { parseTripId } from "@/lib/trip-id";
import { NextRequest, NextResponse } from "next/server";
import { queryOrdersAdmin } from "@/services/orderService";
import { createBooking } from "@/services/bookingService";
import { offlineOrderSchema } from "@/lib/validations/order";
import { OrderQueryParams } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/admin/orders - Danh sách đơn hàng / vé xe phân trang cho admin
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const { searchParams } = new URL(request.url);

    const params: OrderQueryParams = {
      search: searchParams.get("search") || "",
      status: searchParams.get("status") || "",
      date: searchParams.get("date") || "",
      tripId: searchParams.has("tripId") ? parseTripId(searchParams.get("tripId")!) : undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 8,
      sortBy: readOption(searchParams.get("sortBy"), ["createdAt", "totalPrice", "id"] as const, "id"),
      sortOrder: readOption(searchParams.get("sortOrder"), ["asc", "desc"] as const, "desc"),
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
    return apiError(error, "Không thể xử lý yêu cầu lúc này. Vui lòng thử lại.");
  }
}

// POST /api/admin/orders - Tạo đơn vé mới trực tiếp tại quầy (Offline)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await readJson(request);

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
      status,
    });

    return NextResponse.json(
      {
        success: true,
        data: bookingResult,
        message: `Đã tạo vé thành công! Mã vé (PNR): ${bookingResult.pnr}`,
      },
      { status: 201 }
    );
  } catch (error) {
    return apiError(error, "Không thể xử lý yêu cầu lúc này. Vui lòng thử lại.");
  }
}
