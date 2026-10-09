import type { PaginationMeta } from "./common";

export interface Trip {
  id: number;
  from: string;
  to: string;
  time: Date | string;
  price: number;
  availableSeats?: number;
  capacity?: number;
  emptySeats?: number;
  type?: string;
  date?: string;
}

export interface TripQueryParams {
  bookable?: boolean;
  search?: string;
  from?: string;
  to?: string;
  date?: string;
  page?: number;
  limit?: number;
  sortBy?: "time" | "price" | "availableSeats" | "id";
  sortOrder?: "asc" | "desc";
}

export interface TripAdminItem {
  id: number;
  from: string;
  to: string;
  time: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  bookedSeatsCount: number;
  occupancyRate: number;
  createdAt: string;
  bookings: Array<{
    id: number;
    seatNumber: string;
    status: string;
    totalPrice: number;
    userName: string;
    userPhone: string;
  }>;
}

export interface TripStats {
  total: number;
  departingToday: number;
  totalBookings: number;
  avgOccupancy: number;
}

export interface Seat {
  id: string;
  row: string;
  num: number;
  floor: 1 | 2;
  isBooked: boolean;
}

export interface TripSearchParams {
  from?: string;
  to?: string;
  date?: string;
}

export interface TripSearchOption {
  from: string;
  to: string;
  date: string;
}

export interface TripListAdminResponse {
  success: boolean;
  data: TripAdminItem[];
  pagination: PaginationMeta;
  stats: TripStats;
  message?: string;
}
