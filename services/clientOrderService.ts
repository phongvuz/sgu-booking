import { OrderQueryParams, OrderListResponse, OrderDetailResponse, BookingStatus } from "@/types";
import { OfflineOrderFormValues } from "@/lib/validations/order";

export class OrderServiceError extends Error {
  errors?: any[];
  status?: number;

  constructor(message: string, status?: number, errors?: any[]) {
    super(message);
    this.name = "OrderServiceError";
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Fetch orders list for admin
 */
export async function fetchAdminOrders(params: OrderQueryParams = {}): Promise<OrderListResponse> {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.date) query.set("date", params.date);
  if (params.tripId) query.set("tripId", params.tripId);
  if (params.page) query.set("page", params.page.toString());
  if (params.limit) query.set("limit", params.limit.toString());
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  query.set("_t", Date.now().toString());

  const res = await fetch(`/api/admin/orders?${query.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new OrderServiceError(
      data.message || "Không thể tải danh sách đơn vé",
      res.status,
      data.errors
    );
  }

  return data;
}

/**
 * Fetch single order details
 */
export async function fetchOrderById(id: number | string): Promise<OrderDetailResponse> {
  const res = await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new OrderServiceError(
      data.message || `Không thể tải thông tin đơn vé ${id}`,
      res.status
    );
  }

  return data;
}

/**
 * Create offline ticket booking
 */
export async function createOfflineOrder(payload: OfflineOrderFormValues) {
  const res = await fetch("/api/admin/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new OrderServiceError(
      data.message || "Tạo đơn vé offline thất bại",
      res.status,
      data.errors
    );
  }

  return data;
}

/**
 * Update order status (CONFIRMED, PENDING, CANCELLED)
 */
export async function updateOrderStatus(id: number | string, status: BookingStatus) {
  const res = await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new OrderServiceError(
      data.message || `Cập nhật trạng thái đơn vé ${id} thất bại`,
      res.status
    );
  }

  return data;
}

/**
 * Delete order
 */
export async function deleteOrder(id: number | string) {
  const res = await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new OrderServiceError(
      data.message || `Xóa đơn vé ${id} thất bại`,
      res.status
    );
  }

  return data;
}
