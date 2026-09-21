export interface Trip {
  id: number | string;
  code?: string;
  from: string;
  to: string;
  time: Date | string;
  price: number;
  availableSeats?: number;
  emptySeats?: number;
  type?: string;
  date?: string;
}

export interface Seat {
  id: string;
  isBooked: boolean;
}

export interface SearchParams {
  from?: string;
  to?: string;
  date?: string;
}

export const STATION_NAMES: Record<string, string> = {
  SGN: "Hồ Chí Minh",
  DLT: "Đà Lạt",
  NHA: "Nha Trang",
  HAN: "Hà Nội",
  DAD: "Đà Nẵng",
  VT: "Vũng Tàu",
  CTH: "Cần Thơ",
};

export function resolveLocationName(codeOrName?: string): string {
  if (!codeOrName) return "";
  const upper = codeOrName.trim().toUpperCase();
  return STATION_NAMES[upper] || codeOrName.trim();
}

export function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}

export function formatTripTime(time: Date | string): {
  departureTime: string;
  arrivalTime: string;
  timeRange: string;
  dateFormatted: string;
} {
  const d = new Date(time);
  if (isNaN(d.getTime())) {
    const timeStr = String(time);
    return {
      departureTime: timeStr.split(" - ")[0] || timeStr,
      arrivalTime: timeStr.split(" - ")[1] || "",
      timeRange: timeStr,
      dateFormatted: "",
    };
  }

  const depHours = String(d.getHours()).padStart(2, "0");
  const depMinutes = String(d.getMinutes()).padStart(2, "0");
  const departureTime = `${depHours}:${depMinutes}`;

  const arrDate = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  const arrHours = String(arrDate.getHours()).padStart(2, "0");
  const arrMinutes = String(arrDate.getMinutes()).padStart(2, "0");
  const arrivalTime = `${arrHours}:${arrMinutes}`;

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const dateFormatted = `${day}/${month}/${year}`;

  return {
    departureTime,
    arrivalTime,
    timeRange: `${departureTime} - ${arrivalTime}`,
    dateFormatted,
  };
}
