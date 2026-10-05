import { PaginationMeta } from "./employee";

export interface Bus {
  id: string;
  plate: string;
  type: string;
  seats: number;
  status: "Đang hoạt động" | "Bảo dưỡng" | "Ngừng hoạt động" | string;
  brand?: string;
  year?: number;
  driverName?: string;
  driverPhone?: string;
  lastMaintenance?: string;
  notes?: string;
  createdAt: string;
}

export interface BusQueryParams {
  search?: string;
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: "plate" | "seats" | "createdAt" | "id";
  sortOrder?: "asc" | "desc";
}

export interface BusListResponse {
  success: boolean;
  data: Bus[];
  pagination: PaginationMeta;
  stats?: BusStats;
  message?: string;
}

export interface BusDetailResponse {
  success: boolean;
  data?: Bus;
  message?: string;
  errors?: any[];
}

export interface BusStats {
  total: number;
  active: number;
  maintenance: number;
  inactive: number;
}
