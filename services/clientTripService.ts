import { TripQueryParams, PaginationMeta } from "@/types";
import { TripAdminItem, TripStats } from "@/services/tripService";
import { TripFormValues } from "@/lib/validations/trip";

export class TripServiceError extends Error {
  errors?: any[];
  status?: number;

  constructor(message: string, status?: number, errors?: any[]) {
    super(message);
    this.name = "TripServiceError";
    this.status = status;
    this.errors = errors;
  }
}

export interface TripListAdminResponse {
  success: boolean;
  data: TripAdminItem[];
  pagination: PaginationMeta;
  stats: TripStats;
  message?: string;
}

/**
 * Fetch trips list for admin
 */
export async function fetchAdminTrips(params: TripQueryParams = {}): Promise<TripListAdminResponse> {
  const query = new URLSearchParams();

  query.set("admin", "true");
  if (params.search) query.set("search", params.search);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.date) query.set("date", params.date);
  if (params.page) query.set("page", params.page.toString());
  if (params.limit) query.set("limit", params.limit.toString());
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  query.set("_t", Date.now().toString());

  const res = await fetch(`/api/trips?${query.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new TripServiceError(
      data.message || "Không thể tải danh sách chuyến xe",
      res.status,
      data.errors
    );
  }

  return data;
}

/**
 * Create a new trip
 */
export async function createTrip(payload: TripFormValues) {
  const res = await fetch("/api/trips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new TripServiceError(
      data.message || "Tạo mới chuyến xe thất bại",
      res.status,
      data.errors
    );
  }

  return data;
}

/**
 * Update an existing trip by ID
 */
export async function updateTrip(id: number | string, payload: Partial<TripFormValues>) {
  const res = await fetch(`/api/trips/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new TripServiceError(
      data.message || `Cập nhật chuyến xe ${id} thất bại`,
      res.status,
      data.errors
    );
  }

  return data;
}

/**
 * Delete a trip by ID
 */
export async function deleteTrip(id: number | string) {
  const res = await fetch(`/api/trips/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new TripServiceError(
      data.message || `Xóa chuyến xe ${id} thất bại`,
      res.status
    );
  }

  return data;
}
