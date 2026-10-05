"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { OrderItem, OrderQueryParams, PaginationMeta, OrderStats, BookingStatus } from "@/types";
import { OfflineOrderFormValues } from "@/lib/validations/order";
import * as orderService from "@/services/clientOrderService";

export function useOrders(initialParams?: OrderQueryParams) {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    totalRevenue: 0,
  });
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState<string>(initialParams?.search || "");
  const [debouncedSearch, setDebouncedSearch] = useState<string>(search);
  const [status, setStatus] = useState<string>(initialParams?.status || "");
  const [date, setDate] = useState<string>(initialParams?.date || "");
  const [page, setPage] = useState<number>(initialParams?.page || 1);
  const [limit, setLimit] = useState<number>(initialParams?.limit || 8);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 350);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setPage(1);
  };

  const handleDateChange = (val: string) => {
    setDate(val);
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("");
    setDate("");
    setPage(1);
  };

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await orderService.fetchAdminOrders({
        search: debouncedSearch,
        status,
        date,
        page,
        limit,
      });

      setOrders(res.data);
      setPagination(res.pagination);
      if (res.stats) setStats(res.stats);
    } catch (err: any) {
      console.error("Error in loadOrders:", err);
      setError(err?.message || "Không thể tải danh sách đơn vé");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, date, page, limit]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleCreateOffline = async (payload: OfflineOrderFormValues) => {
    setActionLoading(true);
    try {
      const res = await orderService.createOfflineOrder(payload);
      resetFilters();
      await loadOrders();
      return { success: true, message: res.message || "Tạo vé offline thành công!" };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || "Có lỗi xảy ra khi tạo vé",
      };
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeStatus = async (id: number | string, newStatus: BookingStatus) => {
    setActionLoading(true);
    try {
      const res = await orderService.updateOrderStatus(id, newStatus);
      await loadOrders();
      return { success: true, message: res.message || "Cập nhật trạng thái vé thành công!" };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || "Không thể cập nhật trạng thái",
      };
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    setActionLoading(true);
    try {
      const res = await orderService.deleteOrder(id);
      await loadOrders();
      return { success: true, message: res.message || "Xóa đơn vé thành công!" };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || "Có lỗi xảy ra khi xóa đơn vé",
      };
    } finally {
      setActionLoading(false);
    }
  };

  return {
    orders,
    stats,
    pagination,
    loading,
    actionLoading,
    error,
    filters: {
      search,
      status,
      date,
      page,
      limit,
    },
    setSearch: handleSearchChange,
    setStatus: handleStatusChange,
    setDate: handleDateChange,
    setPage,
    setLimit,
    resetFilters,
    refresh: loadOrders,
    createOfflineOrder: handleCreateOffline,
    changeStatus: handleChangeStatus,
    deleteOrder: handleDelete,
  };
}
