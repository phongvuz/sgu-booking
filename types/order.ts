import { PaginationMeta } from "./common";

export type BookingStatus = "CONFIRMED" | "PENDING" | "CANCELLED";

export interface OrderItem {
  id: number;
  pnr: string;
  seatNumber: string;
  status: BookingStatus;
  totalPrice: number;
  createdAt: string;
  user: {
    id: number;
    fullName: string;
    phone: string;
    role: string;
  };
  trip: {
    id: number;
    from: string;
    to: string;
    time: string;
    price: number;
    availableSeats: number;
  };
}

export interface OrderQueryParams {
  search?: string;
  status?: string;
  date?: string;
  tripId?: number;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "totalPrice" | "id";
  sortOrder?: "asc" | "desc";
}

export interface OrderListResponse {
  success: boolean;
  data: OrderItem[];
  pagination: PaginationMeta;
  message?: string;
  stats: OrderStats;
}

export interface OrderDetailResponse {
  success: boolean;
  data?: OrderItem;
  message?: string;
  errors?: unknown[];
}

export interface OrderStats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  totalRevenue: number;
}

export interface CreateOfflineOrderInput {
  tripId: number;
  seats: string[];
  fullName: string;
  phone: string;
  status?: BookingStatus;
}
