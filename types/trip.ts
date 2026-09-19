export interface Trip {
  id: string;
  from: string;
  to: string;
  time: string;
  date: string;
  price: number;
  emptySeats: number;
  type: string;
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
