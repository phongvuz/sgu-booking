import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { holdSeat, releaseSeat } from "@/services/seatService";
import { broadcast } from "@/lib/sse";
import { normalizeSeat } from "@/lib/seats";
import { apiError, readJson } from "@/lib/admin-api";
import { tripIdSchema } from "@/lib/trip-id";

const schema = z.object({
  tripId: tripIdSchema,
  seatNumber: z.string().trim().min(2).max(5),
  clientId: z.string().min(1).max(191),
  action: z.enum(["hold", "release"]),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = schema.safeParse(await readJson(request));
    if (!parsed.success) return NextResponse.json({ success: false, message: "Thông tin giữ ghế không hợp lệ." }, { status: 400 });
    const { tripId, clientId, action } = parsed.data;
    const seatNumber = normalizeSeat(parsed.data.seatNumber);
    if (action === "hold") await holdSeat(tripId, seatNumber, clientId);
    else await releaseSeat(tripId, seatNumber, clientId);
    broadcast(tripId, { type: action === "hold" ? "SEAT_HELD" : "SEAT_RELEASED", payload: { seatNumber, clientId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, "Không thể cập nhật giữ ghế lúc này.");
  }
}
