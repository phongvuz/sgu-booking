import { NextRequest, NextResponse } from "next/server";
import { createBooking, getBookings } from "@/services/bookingService";
import { onlineOrderSchema } from "@/lib/validations/order";
import { apiError, readJson } from "@/lib/admin-api";
import { getCurrentCustomer } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const parsed = onlineOrderSchema.safeParse(await readJson(request));
    if (!parsed.success) return NextResponse.json({ success: false, message: parsed.error.issues.map((issue) => issue.message).join(", ") }, { status: 400 });
    const customer = await getCurrentCustomer();
    const result = await createBooking({ ...parsed.data, ownerId: customer?.userId, status: "PENDING" });
    return NextResponse.json({ success: true, message: "Đã ghi nhận đặt chỗ, chờ thanh toán.", data: result }, { status: 201 });
  } catch (error) {
    return apiError(error, "Không thể đặt vé lúc này. Vui lòng thử lại.");
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookings = await getBookings({ query: searchParams.get("query") ?? "", phone: searchParams.get("phone") ?? "" });
    return NextResponse.json({ success: true, count: bookings.length, data: bookings }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error, "Không thể tra cứu vé lúc này. Vui lòng thử lại.");
  }
}
