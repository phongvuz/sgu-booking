export type EmployeeRole =
  | "Tài xế"
  | "Phụ xe"
  | "Văn phòng"
  | "Quản lý"
  | "Điều hành";

export type EmployeeStatus =
  | "Đang làm việc"
  | "Nghỉ phép"
  | "Đã nghỉ việc";

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: EmployeeRole | string;
  department: string;
  status: EmployeeStatus | string;
  avatar?: string;
  identityCard?: string;
  address?: string;
  startDate: string;
  createdAt: string;
}

export interface EmployeeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  department?: string;
  status?: string;
  sortBy?: "name" | "createdAt" | "id";
  sortOrder?: "asc" | "desc";
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EmployeeListResponse {
  success: boolean;
  data: Employee[];
  pagination: PaginationMeta;
  message?: string;
}

export interface EmployeeDetailResponse {
  success: boolean;
  data: Employee;
  message?: string;
}

export interface CreateEmployeeInput {
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status?: string;
  avatar?: string;
  identityCard?: string;
  address?: string;
  startDate?: string;
  password?: string;
}

export interface UpdateEmployeeInput {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  status?: string;
  avatar?: string;
  identityCard?: string;
  address?: string;
  startDate?: string;
}
