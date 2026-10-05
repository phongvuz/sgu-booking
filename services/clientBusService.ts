import { Bus, BusListResponse, BusDetailResponse, BusQueryParams } from "@/types";
import { BusFormValues } from "@/lib/validations/bus";

export class BusServiceError extends Error {
  errors?: any[];
  status?: number;

  constructor(message: string, status?: number, errors?: any[]) {
    super(message);
    this.name = "BusServiceError";
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Fetch buses list with query filters & pagination
 */
export async function fetchBuses(params: BusQueryParams = {}): Promise<BusListResponse> {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.type) query.set("type", params.type);
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", params.page.toString());
  if (params.limit) query.set("limit", params.limit.toString());
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  query.set("_t", Date.now().toString());

  const res = await fetch(`/api/buses?${query.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new BusServiceError(
      data.message || "Không thể tải danh sách xe",
      res.status,
      data.errors
    );
  }

  return data;
}

/**
 * Fetch single bus details by ID
 */
export async function fetchBusById(id: string): Promise<Bus> {
  const res = await fetch(`/api/buses/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new BusServiceError(
      data.message || `Không thể tải thông tin xe ${id}`,
      res.status
    );
  }

  return data.data;
}

/**
 * Create a new bus
 */
export async function createBus(payload: BusFormValues): Promise<BusDetailResponse> {
  const res = await fetch("/api/buses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new BusServiceError(
      data.message || "Tạo mới xe thất bại",
      res.status,
      data.errors
    );
  }

  return data;
}

/**
 * Update an existing bus by ID
 */
export async function updateBus(id: string, payload: BusFormValues): Promise<BusDetailResponse> {
  const res = await fetch(`/api/buses/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new BusServiceError(
      data.message || `Cập nhật thông tin xe ${id} thất bại`,
      res.status,
      data.errors
    );
  }

  return data;
}

/**
 * Delete a bus by ID
 */
export async function deleteBus(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`/api/buses/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new BusServiceError(
      data.message || `Xóa xe ${id} thất bại`,
      res.status
    );
  }

  return data;
}

/**
 * Quickly change the status of a bus
 */
export async function changeBusStatus(id: string, status: string): Promise<BusDetailResponse> {
  const res = await fetch(`/api/buses/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new BusServiceError(
      data.message || `Cập nhật trạng thái xe thất bại`,
      res.status
    );
  }

  return data;
}
