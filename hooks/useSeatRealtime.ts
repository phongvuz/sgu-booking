"use client";

import { useEffect, useRef, useState } from "react";
import { getErrorMessage, requestJson } from "@/lib/api-client";
import { getSeatCodes } from "@/lib/seats";
import { seatRealtimeMessageSchema } from "@/lib/validations/seat-realtime";
import type { SeatInteractionEvent, SeatInteractionRequest, SeatSelection } from "@/types/seat-realtime";

function updateRemoteSelections(previousSelections: SeatSelection[], event: SeatInteractionEvent): SeatSelection[] {
  const remainingSelections = previousSelections.filter(
    (selection) => selection.clientId !== event.clientId || selection.seatNumber !== event.seatNumber,
  );
  if (event.type === "SEAT_DESELECTED") return remainingSelections;
  return [...remainingSelections, { clientId: event.clientId, seatNumber: event.seatNumber }];
}

export function useSeatRealtime(tripId: number, capacity: number) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [remoteSeats, setRemoteSeats] = useState<SeatSelection[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [viewerCount, setViewerCount] = useState<number | null>(null);
  const [sendError, setSendError] = useState("");
  const [connectionAttempt, setConnectionAttempt] = useState(0);

  // Ref giữ giá trị mới nhất cho callback SSE, không làm mở lại kết nối khi chọn ghế.
  const clientIdReference = useRef("");
  const selectedSeatsReference = useRef<string[]>([]);
  const isSendingReference = useRef(false);
  const isConnectedReference = useRef(false);
  const isMountedReference = useRef(false);
  const connectionAbortReference = useRef<AbortController | null>(null);

  useEffect(() => {
    isMountedReference.current = true;
    if (!clientIdReference.current) {
      clientIdReference.current = typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
    const clientId = clientIdReference.current;
    const connectionAbortController = new AbortController();
    connectionAbortReference.current = connectionAbortController;
    const validSeatNumbers = new Set(getSeatCodes(capacity));
    const eventSource = new EventSource(`/api/trips/${tripId}/stream?clientId=${encodeURIComponent(clientId)}`);
    const connectionTimeout = window.setTimeout(() => {
      if (!isConnectedReference.current) {
        setConnectionError("Chưa kết nối được Realtime. Kiểm tra mạng hoặc thử kết nối lại.");
      }
    }, 10000);

    async function synchronizeSelections() {
      try {
        await requestJson<{ success: boolean }>(`/api/trips/${tripId}/seat-events`, {
          method: "PUT",
          body: JSON.stringify({ tripId, clientId, selectedSeats: selectedSeatsReference.current }),
          signal: AbortSignal.any([connectionAbortController.signal, AbortSignal.timeout(10000)]),
        });
        if (connectionAbortController.signal.aborted || eventSource.readyState !== EventSource.OPEN) return;
        isConnectedReference.current = true;
        setIsConnected(true);
        setConnectionError("");
        window.clearTimeout(connectionTimeout);
      } catch (error) {
        if (connectionAbortController.signal.aborted) return;
        isConnectedReference.current = false;
        setIsConnected(false);
        setConnectionError(getErrorMessage(error, "Không thể đồng bộ Realtime. Hãy thử kết nối lại."));
      }
    }

    function handleMessage(message: MessageEvent<string>) {
      let receivedData: unknown;
      try {
        receivedData = JSON.parse(message.data);
      } catch {
        setConnectionError("Server gửi dữ liệu Realtime không hợp lệ.");
        return;
      }
      const parsedMessage = seatRealtimeMessageSchema.safeParse(receivedData);
      // Bỏ qua sự kiện giữ ghế cũ; đó là một nghiệp vụ riêng.
      if (!parsedMessage.success) {
        const isLegacyHold = typeof receivedData === "object" && receivedData !== null
          && "type" in receivedData
          && (receivedData.type === "SEAT_HELD" || receivedData.type === "SEAT_RELEASED");
        if (!isLegacyHold) setConnectionError("Server gửi sự kiện ghế không hợp lệ.");
        return;
      }
      const seatEvent = parsedMessage.data;
      if (seatEvent.tripId !== tripId) return;

      if (seatEvent.type === "VIEWERS_UPDATED") {
        setViewerCount(seatEvent.viewerCount);
        return;
      }

      if (seatEvent.type === "SEAT_SNAPSHOT") {
        if (seatEvent.selections.some((selection) => !validSeatNumbers.has(selection.seatNumber))) {
          setConnectionError("Trạng thái Realtime chứa ghế không thuộc chuyến xe.");
          return;
        }
        const otherSelections = seatEvent.selections.filter((selection) => selection.clientId !== clientId);
        setRemoteSeats(otherSelections);
        // Trong lúc offline, một người khác có thể đã chọn ghế cũ của mình.
        // Loại ghế đó trước khi PUT để kết nối lại không bị kẹt vì xung đột.
        const availableOwnSeats = selectedSeatsReference.current.filter(
          (seatNumber) => !otherSelections.some((selection) => selection.seatNumber === seatNumber),
        );
        if (availableOwnSeats.length !== selectedSeatsReference.current.length) {
          selectedSeatsReference.current = availableOwnSeats;
          setSelectedSeats(availableOwnSeats);
        }
        setViewerCount(seatEvent.viewerCount);
        // Đồng bộ chỉ khi nhận snapshot của kết nối mới, không theo mỗi lần state đổi.
        void synchronizeSelections();
        return;
      }
      if (!validSeatNumbers.has(seatEvent.seatNumber) || seatEvent.clientId === clientId) return;
      setRemoteSeats((previousSelections) => updateRemoteSelections(previousSelections, seatEvent));
    }

    function handleConnectionError() {
      isConnectedReference.current = false;
      setIsConnected(false);
      setConnectionError("Mất kết nối Realtime. Trình duyệt đang thử kết nối lại…");
    }

    function handleOffline() {
      eventSource.close();
      isConnectedReference.current = false;
      setIsConnected(false);
      setConnectionError("Mất kết nối Realtime. Thiết bị đang ngoại tuyến.");
    }

    function handleOnline() {
      isConnectedReference.current = false;
      setIsConnected(false);
      setConnectionError("");
      setConnectionAttempt((previousAttempt) => previousAttempt + 1);
    }

    eventSource.addEventListener("message", handleMessage);
    eventSource.addEventListener("error", handleConnectionError);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    if (!navigator.onLine) handleOffline();
    return () => {
      isMountedReference.current = false;
      isConnectedReference.current = false;
      connectionAbortController.abort();
      window.clearTimeout(connectionTimeout);
      eventSource.removeEventListener("message", handleMessage);
      eventSource.removeEventListener("error", handleConnectionError);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      eventSource.close();
    };
  }, [tripId, capacity, connectionAttempt]);

  function reconnect() {
    isConnectedReference.current = false;
    setIsConnected(false);
    setConnectionError("");
    setConnectionAttempt((previousAttempt) => previousAttempt + 1);
  }

  async function toggleSeat(seatNumber: string) {
    if (isSendingReference.current) return;
    if (!isConnectedReference.current) {
      setSendError("Chưa kết nối Realtime. Vui lòng kết nối lại trước khi chọn ghế.");
      return;
    }

    const previousSeats = selectedSeatsReference.current;
    const isSelected = previousSeats.includes(seatNumber);
    if (!isSelected && remoteSeats.some((selection) => selection.seatNumber === seatNumber)) return;
    if (!isSelected && previousSeats.length >= 5) {
      setSendError("Bạn chỉ được chọn tối đa 5 ghế trong một lượt đặt.");
      return;
    }
    const nextSeats = isSelected
      ? previousSeats.filter((selectedSeat) => selectedSeat !== seatNumber)
      : [...previousSeats, seatNumber];
    const request: SeatInteractionRequest = {
      tripId, seatNumber, clientId: clientIdReference.current,
      type: isSelected ? "SEAT_DESELECTED" : "SEAT_SELECTED",
    };
    const connectionAbortController = connectionAbortReference.current;
    if (!connectionAbortController) return;

    selectedSeatsReference.current = nextSeats;
    setSelectedSeats(nextSeats);
    setSendError("");
    isSendingReference.current = true;
    setIsSending(true);

    try {
      await requestJson<{ success: boolean }>(`/api/trips/${tripId}/seat-events`, {
        method: "POST",
        body: JSON.stringify(request),
        signal: AbortSignal.any([connectionAbortController.signal, AbortSignal.timeout(10000)]),
      });
    } catch (error) {
      if (!isMountedReference.current) return;
      selectedSeatsReference.current = previousSeats;
      setSelectedSeats(previousSeats);
      setSendError(getErrorMessage(error, "Không thể gửi thao tác chọn ghế."));
      // Có thể server đã nhận POST nhưng response bị mất: kết nối lại và PUT
      // danh sách đã hoàn tác để hai phía trở về cùng trạng thái.
      reconnect();
    } finally {
      if (isMountedReference.current) {
        isSendingReference.current = false;
        setIsSending(false);
      }
    }
  }

  return {
    selectedSeats, remoteSeats, isConnected, isSending,
    connectionError, viewerCount, sendError, toggleSeat, reconnect,
  };
}
