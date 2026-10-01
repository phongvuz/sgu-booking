import {
  Employee,
  EmployeeListResponse,
  EmployeeDetailResponse,
  EmployeeQueryParams,
} from "@/types";
import { EmployeeFormValues } from "@/lib/validations/employee";

export class EmployeeServiceError extends Error {
  errors?: any[];
  status?: number;

  constructor(message: string, status?: number, errors?: any[]) {
    super(message);
    this.name = "EmployeeServiceError";
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Fetch employee list with query filters & pagination
 */
export async function fetchEmployees(
  params: EmployeeQueryParams = {}
): Promise<EmployeeListResponse> {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.role) query.set("role", params.role);
  if (params.department) query.set("department", params.department);
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", params.page.toString());
  if (params.limit) query.set("limit", params.limit.toString());
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  query.set("_t", Date.now().toString());

  const res = await fetch(`/api/employees?${query.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new EmployeeServiceError(
      data.message || "Không thể tải danh sách nhân viên",
      res.status,
      data.errors
    );
  }

  return data;
}

/**
 * Fetch single employee details by ID
 */
export async function fetchEmployeeById(id: string): Promise<Employee> {
  const res = await fetch(`/api/employees/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new EmployeeServiceError(
      data.message || `Không thể tải thông tin nhân viên ${id}`,
      res.status
    );
  }

  return data.data;
}

/**
 * Create a new employee
 */
export async function createEmployee(
  payload: EmployeeFormValues
): Promise<EmployeeDetailResponse> {
  const res = await fetch("/api/employees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new EmployeeServiceError(
      data.message || "Tạo mới nhân viên thất bại",
      res.status,
      data.errors
    );
  }

  return data;
}

/**
 * Update an existing employee by ID
 */
export async function updateEmployee(
  id: string,
  payload: EmployeeFormValues
): Promise<EmployeeDetailResponse> {
  const res = await fetch(`/api/employees/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new EmployeeServiceError(
      data.message || `Cập nhật nhân viên ${id} thất bại`,
      res.status,
      data.errors
    );
  }

  return data;
}

/**
 * Delete an employee by ID
 */
export async function deleteEmployee(
  id: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`/api/employees/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new EmployeeServiceError(
      data.message || `Xóa nhân viên ${id} thất bại`,
      res.status
    );
  }

  return data;
}

/**
 * Quickly change the status of an employee
 */
export async function changeEmployeeStatus(
  id: string,
  status: string
): Promise<EmployeeDetailResponse> {
  const res = await fetch(`/api/employees/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new EmployeeServiceError(
      data.message || `Cập nhật trạng thái thất bại`,
      res.status
    );
  }

  return data;
}
