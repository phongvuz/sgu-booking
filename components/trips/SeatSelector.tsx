"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
<<<<<<< Updated upstream

interface Seat {
  id: string;
  isBooked: boolean;
}
=======
import generateSeats, { Seat } from "./seatUtils";
import SeatMap from "./SeatMap";
import BookingForm from "./BookingForm";
>>>>>>> Stashed changes

interface SeatSelectorProps {
  tripId: string;
  pricePerSeatStr: number; // e.g. "300.000đ"
}

export default function SeatSelector({ tripId, pricePerSeatStr }: SeatSelectorProps) {
  const router = useRouter();
<<<<<<< Updated upstream
  
  // Generate some dummy seats for a sleeper bus (2 floors, 3 rows)
  const [seats] = useState<Seat[]>(() => {
    const generated = [];
    const rows = ['A', 'B', 'C'];
    for (let floor = 1; floor <= 2; floor++) {
      for (const row of rows) {
        for (let num = 1; num <= 6; num++) {
          generated.push({
            id: `${floor}${row}${num}`,
            isBooked: Math.random() > 0.7, // 30% booked
          });
        }
      }
    }
    return generated;
  });
=======

  const [clientId] = useState(() => Math.random().toString(36).substring(2, 15));

  const [seats] = useState<Seat[]>(() => generateSeats(bookedSeats));
>>>>>>> Stashed changes

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [heldSeats, setHeldSeats] = useState<Record<string, string>>({}); 
  
  const [passengerName, setPassengerName] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");

<<<<<<< Updated upstream
  const toggleSeat = (seatId: string, isBooked: boolean) => {
    if (isBooked) return;
    
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      } else {
        if (prev.length >= 5) {
          alert("Bạn chỉ được chọn tối đa 5 ghế");
          return prev;
=======
  // realtime
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
>>>>>>> Stashed changes
        }
      } catch {
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

<<<<<<< Updated upstream
  const handleCheckout = (e: React.FormEvent) => {
=======
  // 5. Xử lý đặt vé
  const handleCheckout = async (e: React.FormEvent) => {
>>>>>>> Stashed changes
    e.preventDefault();
    if (selectedSeats.length === 0) {
      alert("Vui lòng chọn ít nhất 1 ghế!");
      return;
    }
    if (!passengerName || !passengerPhone) {
      alert("Vui lòng nhập đầy đủ thông tin hành khách!");
      return;
    }
<<<<<<< Updated upstream
    
    // In a real app, save to state management or API here
    router.push(`/success?tripId=${tripId}&seats=${selectedSeats.join(",")}`);
=======

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
>>>>>>> Stashed changes
  };

  const totalPrice = selectedSeats.length * pricePerSeatStr;

<<<<<<< Updated upstream
  const renderFloor = (floorNum: number) => {
    const floorSeats = seats.filter(s => s.id.startsWith(floorNum.toString()));
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg">
        <h4 className="text-center font-bold text-gray-700 mb-4 pb-2 border-b">
          Tầng {floorNum === 1 ? "Dưới" : "Trên"}
        </h4>
        <div className="grid grid-cols-3 gap-x-4 gap-y-3">
          {['A', 'B', 'C'].map((row) => (
            <div key={row} className="flex flex-col gap-3">
              {floorSeats.filter(s => s.id.charAt(1) === row).map(seat => (
                <button
                  key={seat.id}
                  type="button"
                  onClick={() => toggleSeat(seat.id, seat.isBooked)}
                  disabled={seat.isBooked}
                  className={`w-full py-3 rounded text-sm font-bold border transition-colors ${
                    seat.isBooked 
                      ? "bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed opacity-50" 
                      : selectedSeats.includes(seat.id)
                        ? "bg-[#ef5222] text-white border-[#ef5222]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-[#ef5222] hover:text-[#ef5222]"
                  }`}
                >
                  {seat.id.substring(1)}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Left: Seat Map */}
      <div className="w-full md:w-7/12">
        <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Chọn ghế của bạn</h3>
            <div className="flex gap-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                <span>Trống</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#ef5222] border border-[#ef5222] rounded"></div>
                <span>Đang chọn</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 border border-gray-400 rounded opacity-50"></div>
                <span>Đã đặt</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {renderFloor(1)}
            {renderFloor(2)}
          </div>
        </div>
      </div>

      {/* Right: Checkout Summary */}
      <div className="w-full md:w-5/12">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sticky top-24">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Thông tin thanh toán</h3>
          
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Ghế đã chọn:</span>
              <span className="font-bold">{selectedSeats.length > 0 ? selectedSeats.join(", ") : "Chưa chọn"}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Tạm tính:</span>
              <span className="font-bold">{totalPrice.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
              <span className="text-gray-800 font-bold text-lg">Tổng tiền:</span>
              <span className="font-extrabold text-2xl text-[#ef5222]">{totalPrice.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>

          <form onSubmit={handleCheckout}>
            <h4 className="font-bold text-gray-800 mb-3 text-sm">Thông tin hành khách</h4>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Họ và tên *</label>
                <input 
                  type="text" 
                  required
                  value={passengerName}
                  onChange={e => setPassengerName(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-[#ef5222]" 
                  placeholder="Nhập họ tên" 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Số điện thoại *</label>
                <input 
                  type="tel" 
                  required
                  value={passengerPhone}
                  onChange={e => setPassengerPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-[#ef5222]" 
                  placeholder="Nhập số điện thoại" 
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={selectedSeats.length === 0}
              className={`w-full font-bold py-3 px-4 rounded-md transition-colors ${
                selectedSeats.length > 0 
                  ? "bg-[#ef5222] hover:bg-[#d94a1d] text-white" 
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Thanh toán ngay
            </button>
          </form>
        </div>
=======
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
>>>>>>> Stashed changes
      </div>
    </div>
  );
}
