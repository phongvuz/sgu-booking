import { NextRequest, NextResponse } from "next/server";
import { getActiveSeatHolds } from "@/services/seatService";
import { parseTripId } from "@/lib/trip-id";
import { apiError } from "@/lib/admin-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tripId = parseTripId(id);
    
    const activeHolds = await getActiveSeatHolds(tripId);
    
    return NextResponse.json({ success: true, holds: activeHolds });
  } catch (error) {
    return apiError(error, "Không thể tải ghế đang được giữ lúc này.");
  }
}
