import { NextRequest } from "next/server";
import { addClient, removeClient } from "@/lib/sse";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: tripId } = await params;

  let cleanup: () => void;

  const stream = new ReadableStream({
    start(controller) {
      addClient(tripId, controller);
      cleanup = () => removeClient(tripId, controller);

      // Keep alive heartbeat
      const heartbeatId = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(":\n\n"));
        } catch (e) {
          clearInterval(heartbeatId);
          cleanup();
        }
      }, 15000);

      // Handle stream cancellation (e.g. client disconnect)
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeatId);
        cleanup();
      });
    },
    cancel() {
      if (cleanup) cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
