import { UserAccount, UserQueryParams, UserListResponse, UserDetailResponse } from "@/types";
import { UserFormValues } from "@/lib/validations/user";

export class UserServiceError extends Error {
  errors?: any[];
  status?: number;

  constructor(message: string, status?: number, errors?: any[]) {
    super(message);
    this.name = "UserServiceError";
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Fetch users list for admin
 */
export async function fetchAdminUsers(params: UserQueryParams = {}): Promise<UserListResponse> {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.role) query.set("role", params.role);
  if (params.page) query.set("page", params.page.toString());
  if (params.limit) query.set("limit", params.limit.toString());
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  query.set("_t", Date.now().toString());

  const res = await fetch(`/api/users?${query.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new UserServiceError(
      data.message || "Không thể tải danh sách tài khoản",
      res.status,
      data.errors
    );
  }

  return data;
}

/**
 * Fetch single user details with booking history
 */
export async function fetchUserById(id: number | string): Promise<UserDetailResponse> {
  const res = await fetch(`/api/users/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new UserServiceError(
      data.message || `Không thể tải thông tin người dùng ${id}`,
      res.status
    );
  }

  return data;
}

/**
 * Create a new user
 */
export async function createUser(payload: UserFormValues) {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new UserServiceError(
      data.message || "Tạo tài khoản người dùng thất bại",
      res.status,
      data.errors
    );
  }

  return data;
}

/**
 * Update user info
 */
export async function updateUser(id: number | string, payload: Partial<UserFormValues>) {
  const res = await fetch(`/api/users/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new UserServiceError(
      data.message || `Cập nhật người dùng ${id} thất bại`,
      res.status,
      data.errors
    );
  }

  return data;
}

/**
 * Delete user
 */
export async function deleteUser(id: number | string) {
  const res = await fetch(`/api/users/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new UserServiceError(
      data.message || `Xóa người dùng ${id} thất bại`,
      res.status
    );
  }

  return data;
}

/**
 * Toggle user role (USER <-> ADMIN)
 */
export async function changeUserRole(id: number | string, role: "USER" | "ADMIN") {
  const res = await fetch(`/api/users/${encodeURIComponent(id)}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new UserServiceError(
      data.message || `Đổi vai trò người dùng thất bại`,
      res.status
    );
  }

  return data;
}
