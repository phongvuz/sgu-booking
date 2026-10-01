import { NextRequest, NextResponse } from "next/server";
import { holdSeat, releaseSeat } from "@/services/seatService";
import { broadcast } from "@/lib/sse";

export async function POST(request: NextRequest) {
  try {
    const { tripId, seatNumber, clientId, action } = await request.json();

    if (!tripId || !seatNumber || !clientId || !action) {
      return NextResponse.json({ success: false, message: "Missing params" }, { status: 400 });
    }

    const numTripId = Number(tripId);

    if (action === "hold") {
      try {
        await holdSeat(numTripId, seatNumber, clientId);

        // Broadcast event
        broadcast(String(numTripId), {
          type: "SEAT_HELD",
          payload: { seatNumber, clientId }
        });

        return NextResponse.json({ success: true });
      } catch (e: any) {
        return NextResponse.json({ success: false, message: e.message, conflict: true }, { status: 409 });
      }
    } else if (action === "release") {
      await releaseSeat(numTripId, seatNumber, clientId);
      
      broadcast(String(numTripId), {
        type: "SEAT_RELEASED",
        payload: { seatNumber, clientId }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Hold error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
