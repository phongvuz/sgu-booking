"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import generateSeats, { Seat } from "./seatUtils";
import SeatMap from "./SeatMap";
import BookingForm from "./BookingForm";

interface SeatSelectorProps {
  tripId: string;
  tripCode?: string;
  pricePerSeatStr: number; // e.g. 300000
  bookedSeats?: string[];
}

export default function SeatSelector({
  tripId,
  tripCode,
  pricePerSeatStr,
  bookedSeats = [],
}: SeatSelectorProps) {
  const router = useRouter();

  const [clientId] = useState(() => Math.random().toString(36).substring(2, 15));
  const [seats] = useState<Seat[]>(() => generateSeats(bookedSeats));

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [heldSeats, setHeldSeats] = useState<Record<string, string>>({});

  const [passengerName, setPassengerName] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 1. Realtime holds & SSE stream
  useEffect(() => {
    const fetchHolds = async () => {
      try {
        const res = await fetch(`/api/trips/${tripId}/holds`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.holds) {
            const newHolds: Record<string, string> = {};
            data.holds.forEach((h: { seatNumber: string; clientId: string }) => {
              newHolds[h.seatNumber] = h.clientId;
            });
            setHeldSeats(newHolds);
          }
        }
      } catch {
        // ignore fetch error
      }
    };

    fetchHolds();

    const eventSource = new EventSource(`/api/trips/${tripId}/stream`);

    eventSource.onopen = () => {
      fetchHolds();
    };

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "SEAT_HELD") {
          setHeldSeats((prev) => ({ ...prev, [data.payload.seatNumber]: data.payload.clientId }));
        } else if (data.type === "SEAT_RELEASED") {
          setHeldSeats((prev) => {
            const next = { ...prev };
            delete next[data.payload.seatNumber];
            return next;
          });
        }
      } catch {
        // ignore parse error
      }
    };

    return () => {
      eventSource.close();
    };
  }, [tripId]);

  // 2. Lưu trữ selectedSeats mới nhất để xử lý unmount cleanup
  const selectedSeatsRef = useRef(selectedSeats);
  useEffect(() => {
    selectedSeatsRef.current = selectedSeats;
  }, [selectedSeats]);

  // 3. Tự động nhả ghế khi người dùng rời trang hoặc đóng trình duyệt
  useEffect(() => {
    const handleBeforeUnload = async () => {
      const currentSelected = selectedSeatsRef.current;
      if (currentSelected.length > 0 && clientId) {
        for (const seat of currentSelected) {
          await fetch("/api/seats/hold", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tripId,
              seatNumber: seat,
              clientId,
              action: "release",
            }),
            keepalive: true,
          });
        }
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [tripId, clientId]);

  // 4. Xử lý logic chọn / bỏ chọn ghế
  const toggleSeat = async (seatId: string, isBooked: boolean) => {
    if (isBooked) return;
    const holder = heldSeats[seatId];
    if (holder && holder !== clientId) {
      alert("Ghế này đang được người khác giữ, vui lòng chọn ghế khác.");
      return;
    }

    setErrorMessage("");
    const isSelecting = !selectedSeats.includes(seatId);

    if (isSelecting) {
      if (selectedSeats.length >= 3) {
        alert("Bạn chỉ được chọn tối đa 3 ghế trong một lượt đặt");
        return;
      }

      setSelectedSeats((prev) => [...prev, seatId]);
      setHeldSeats((prev) => ({ ...prev, [seatId]: clientId }));

      try {
        const res = await fetch("/api/seats/hold", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tripId,
            seatNumber: seatId,
            clientId,
            action: "hold",
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setSelectedSeats((prev) => prev.filter((id) => id !== seatId));
          if (data.conflict) {
            alert(data.message || "Ghế này đã bị người khác chọn trước. Vui lòng chọn ghế khác.");
          } else {
            alert("Lỗi giữ ghế, vui lòng thử lại.");
          }

          const holdsRes = await fetch(`/api/trips/${tripId}/holds`);
          if (holdsRes.ok) {
            const hdata = await holdsRes.json();
            if (hdata.success && hdata.holds) {
              const newHolds: Record<string, string> = {};
              hdata.holds.forEach((h: { seatNumber: string; clientId: string }) => {
                newHolds[h.seatNumber] = h.clientId;
              });
              setHeldSeats(newHolds);
            }
          }
        }
      } catch {
        setSelectedSeats((prev) => prev.filter((id) => id !== seatId));
        setHeldSeats((prev) => {
          const next = { ...prev };
          delete next[seatId];
          return next;
        });
        alert("Lỗi kết nối. Không thể giữ ghế.");
      }
    } else {
      // Optimistic Release
      setSelectedSeats((prev) => prev.filter((id) => id !== seatId));
      setHeldSeats((prev) => {
        const next = { ...prev };
        delete next[seatId];
        return next;
      });

      try {
        await fetch("/api/seats/hold", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tripId,
            seatNumber: seatId,
            clientId,
            action: "release",
          }),
        });
      } catch {
        // ignore error
      }
    }
  };

  // 5. Xử lý đặt vé
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSeats.length === 0) {
      alert("Vui lòng chọn ít nhất 1 ghế!");
      return;
    }
    if (!passengerName || !passengerPhone) {
      alert("Vui lòng nhập đầy đủ thông tin hành khách!");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          seats: selectedSeats,
          fullName: passengerName.trim(),
          phone: passengerPhone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Đặt vé không thành công, vui lòng thử lại.");
        setIsSubmitting(false);
        return;
      }

      setSelectedSeats([]);
      const pnr = data.data?.pnr || `NHAXE-${tripCode || tripId}`;
      router.push(
        `/success?tripId=${tripId}&tripCode=${tripCode || ""}&seats=${selectedSeats.join(",")}&pnr=${pnr}&name=${encodeURIComponent(passengerName)}&total=${totalPrice}`
      );
    } catch (err) {
      console.error("Lỗi khi kết nối đặt vé:", err);
      setErrorMessage("Lỗi kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.");
      setIsSubmitting(false);
    }
  };

  const totalPrice = selectedSeats.length * pricePerSeatStr;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-7/12">
        <SeatMap
          seats={seats}
          selectedSeats={selectedSeats}
          heldSeats={heldSeats}
          clientId={clientId}
          isSubmitting={isSubmitting}
          onToggleSeat={toggleSeat}
        />
      </div>

      <div className="w-full md:w-5/12">
        <BookingForm
          tripId={tripId}
          tripCode={tripCode}
          selectedSeats={selectedSeats}
          pricePerSeatStr={pricePerSeatStr}
          totalPrice={totalPrice}
          passengerName={passengerName}
          passengerPhone={passengerPhone}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          onNameChange={setPassengerName}
          onPhoneChange={setPassengerPhone}
          onSubmit={handleCheckout}
        />
      </div>
    </div>
  );
}
