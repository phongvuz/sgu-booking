import { NextRequest, NextResponse } from "next/server";
import { getActiveSeatHolds } from "@/services/seatService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tripId } = await params;
    const numTripId = Number(tripId);
    
    const activeHolds = await getActiveSeatHolds(numTripId);
    
    return NextResponse.json({ success: true, holds: activeHolds });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
