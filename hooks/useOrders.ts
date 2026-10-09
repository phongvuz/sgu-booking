"use client";

import { useCallback, useState } from "react";
import type { OrderQueryParams, OrderListResponse, BookingStatus } from "@/types";
import type { OfflineOrderFormValues } from "@/lib/validations/order";
import * as service from "@/services/clientOrderService";
import { useDebouncedSearch } from "./useDebouncedSearch";
import { useRemoteData } from "./useRemoteData";
import { useAsyncAction } from "./useAsyncAction";

const INITIAL_DATA: OrderListResponse = {
  success: true,
  data: [],
  pagination: { page: 1, limit: 8, total: 0, totalPages: 1 },
  stats: { total: 0, confirmed: 0, pending: 0, cancelled: 0, totalRevenue: 0 },
};

export function useOrders(initialParams?: OrderQueryParams) {
  const [page, setPage] = useState(initialParams?.page ?? 1);
  const [limit, setLimit] = useState(initialParams?.limit ?? 8);
  const [status, setStatus] = useState(initialParams?.status ?? "");
  const [date, setDate] = useState(initialParams?.date ?? "");
  const resetPage = useCallback(() => setPage(1), []);
  const { search, appliedSearch, changeSearch, resetSearch } = useDebouncedSearch(initialParams?.search ?? "", resetPage);
  const { actionLoading, runAction } = useAsyncAction();

  const load = useCallback((signal: AbortSignal) => service.fetchAdminOrders({
    search: appliedSearch, status, date, page, limit,
  }, signal), [appliedSearch, status, date, page, limit]);
  const { data, loading, error, refresh } = useRemoteData(load, INITIAL_DATA);

  function resetFilters() {
    resetSearch();
    setStatus("");
    setDate("");
    setPage(1);
  }

  function filterStatus(value: string) {
    setStatus(value);
    setPage(1);
  }

  function filterDate(value: string) {
    setDate(value);
    setPage(1);
  }

  function createOfflineOrder(payload: OfflineOrderFormValues) {
    return runAction(async () => {
      const response = await service.createOfflineOrder(payload);
      resetFilters();
      refresh();
      return response.message || "Tạo vé tại quầy thành công!";
    });
  }

  function changeStatus(id: number | string, status: BookingStatus) {
    return runAction(async () => {
      const response = await service.updateOrderStatus(id, status);
      refresh();
      return response.message || "Cập nhật trạng thái vé thành công!";
    });
  }

  function deleteOrder(id: number | string) {
    return runAction(async () => {
      const response = await service.deleteOrder(id);
      refresh();
      return response.message || "Xóa đơn vé thành công!";
    });
  }

  return {
    orders: data.data,
    stats: data.stats,
    pagination: data.pagination,
    loading, error, actionLoading,
    filters: { search, status, date, page, limit },
    setSearch: changeSearch,
    setStatus: filterStatus,
    setDate: filterDate,
    setPage, setLimit, resetFilters, refresh,
    createOfflineOrder, changeStatus, deleteOrder,
  };
}
