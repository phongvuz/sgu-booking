"use client";

import { useCallback, useState } from "react";
import type { OrderQueryParams, OrderListResponse, BookingStatus } from "@/types";
import type { OfflineOrderFormValues } from "@/lib/validations/order";
import * as orderService from "@/services/clientOrderService";
import { useDebouncedSearch } from "./useDebouncedSearch";
import { useRemoteData } from "./useRemoteData";
import { useAsyncAction } from "./useAsyncAction";
import { useTableSort } from "./useTableSort";
import { orderSortOptions } from "@/lib/admin-table-sort";

// Dữ liệu hiển thị trước khi API trả kết quả.
const INITIAL_DATA: OrderListResponse = {
  success: true,
  data: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  stats: {
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    totalRevenue: 0,
  },
};

export function useOrders(initialParams?: OrderQueryParams) {
  const [page, setPage] = useState(initialParams?.page ?? 1);
  const [limit, setLimit] = useState(initialParams?.limit ?? 10);
  const [status, setStatus] = useState(initialParams?.status ?? "");
  const [date, setDate] = useState(initialParams?.date ?? "");
  const resetPage = useCallback(function resetPage() {
    setPage(1);
  }, []);
  const { sort, setSort } = useTableSort({
    sortBy: initialParams?.sortBy ?? "createdAt",
    sortOrder: initialParams?.sortOrder ?? "desc",
  }, resetPage, orderSortOptions);
  const { search, appliedSearch, changeSearch, resetSearch } = useDebouncedSearch(initialParams?.search ?? "", resetPage);
  const { actionLoading, runAction } = useAsyncAction();

  // useCallback giữ hàm tải ổn định; chỉ tải lại khi bộ lọc thay đổi.
  const loadOrders = useCallback(
    function loadOrders(signal: AbortSignal) {
      return orderService.fetchAdminOrders(
        {
          search: appliedSearch,
          status,
          date,
          page,
          limit,
          sortBy: sort.sortBy,
          sortOrder: sort.sortOrder,
        },
        signal,
      );
    },
    [appliedSearch, status, date, page, limit, sort],
  );
  const { data, loading, error, refresh } = useRemoteData(loadOrders, INITIAL_DATA);

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
      const response = await orderService.createOfflineOrder(payload);
      resetFilters();
      refresh();
      return response.message || "Tạo vé tại quầy thành công!";
    });
  }

  function changeStatus(id: number | string, status: BookingStatus) {
    return runAction(async () => {
      const response = await orderService.updateOrderStatus(id, status);
      refresh();
      return response.message || "Cập nhật trạng thái vé thành công!";
    });
  }

  function deleteOrder(id: number | string) {
    return runAction(async () => {
      const response = await orderService.deleteOrder(id);
      refresh();
      return response.message || "Xóa đơn vé thành công!";
    });
  }

  return {
    orders: data.data,
    stats: data.stats,
    pagination: data.pagination,
    loading,
    error,
    actionLoading,
    sort,
    setSort,
    filters: {
      search,
      status,
      date,
      page,
      limit,
    },
    setSearch: changeSearch,
    setStatus: filterStatus,
    setDate: filterDate,
    setPage,
    setLimit,
    resetFilters,
    refresh,
    createOfflineOrder,
    changeStatus,
    deleteOrder,
  };
}
