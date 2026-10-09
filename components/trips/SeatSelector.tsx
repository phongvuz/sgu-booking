"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SeatMap from "./SeatMap";
import BookingForm from "./BookingForm";
import generateSeats from "./seatUtils";
import { getErrorMessage, requestJson } from "@/lib/api-client";
import type { BookingResult } from "@/types";

interface SeatSelectorProps {
  tripId: number;
  pricePerSeat: number;
  capacity: number;
  bookedSeats?: string[];
}

export default function SeatSelector({
  tripId,
  pricePerSeat, capacity,
  bookedSeats = [],
}: SeatSelectorProps) {
  const router = useRouter();

  const seats = generateSeats(bookedSeats, capacity);

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengerName, setPassengerName] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const toggleSeat = (seatId: string, isBooked: boolean) => {
    if (isBooked) return;
    setErrorMessage("");

    if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5) {
      setErrorMessage("Bạn chỉ được chọn tối đa 5 ghế trong một lượt đặt");
      return;
    }
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (selectedSeats.length === 0) {
      setErrorMessage("Vui lòng chọn ít nhất 1 ghế!");
      return;
    }
    if (!passengerName.trim() || !passengerPhone.trim()) {
      setErrorMessage("Vui lòng nhập đầy đủ họ tên và số điện thoại hành khách!");
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await requestJson<{ success: boolean; data: BookingResult }>("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          seats: selectedSeats,
          fullName: passengerName.trim(),
          phone: passengerPhone.trim(),
        }),
      });

      // Đặt vé thành công -> Chuyển đến trang xác nhận vé thật
      const pnr = data.data?.pnr || `NHAXE-${tripId}`;
      router.push(
        `/success?tripId=${tripId}&seats=${selectedSeats.join(",")}&pnr=${pnr}&name=${encodeURIComponent(passengerName)}&total=${totalPrice}`
      );
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPrice = selectedSeats.length * pricePerSeat;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-7/12">
        <SeatMap seats={seats} selectedSeats={selectedSeats} isSubmitting={isSubmitting} onToggleSeat={toggleSeat} />
      </div>
      <div className="w-full md:w-5/12">
        <BookingForm
          tripId={tripId} selectedSeats={selectedSeats}
          pricePerSeat={pricePerSeat} totalPrice={totalPrice}
          passengerName={passengerName} passengerPhone={passengerPhone}
          isSubmitting={isSubmitting} errorMessage={errorMessage}
          onNameChange={setPassengerName} onPhoneChange={setPassengerPhone} onSubmit={handleCheckout}
        />
      </div>
    </div>
  );
}
