import type { BookingStatus } from "./order";

export interface CreateBookingInput {
  tripId: number;
  seats: string[];
  fullName: string;
  phone: string;
  status?: BookingStatus;
  clientId?: string;
  ownerId?: number;
}

export interface BookingResult {
  pnr: string;
  tripId: number;
  passenger: {
    name: string;
    phone: string;
  };
  seats: string[];
  totalPrice: number;
  bookingIds: number[];
}

