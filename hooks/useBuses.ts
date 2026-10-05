"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bus, PaginationMeta, BusQueryParams, BusStats } from "@/types";
import { BusFormValues } from "@/lib/validations/bus";
import * as busService from "@/services/clientBusService";

export function useBuses(initialParams?: BusQueryParams) {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [stats, setStats] = useState<BusStats>({
    total: 0,
    active: 0,
    maintenance: 0,
    inactive: 0,
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
  const [type, setType] = useState<string>(initialParams?.type || "");
  const [status, setStatus] = useState<string>(initialParams?.status || "");
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

  const handleTypeChange = (val: string) => {
    setType(val);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setType("");
    setStatus("");
    setPage(1);
  };

  const loadBuses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await busService.fetchBuses({
        search: debouncedSearch,
        type,
        status,
        page,
        limit,
      });

      setBuses(res.data);
      setPagination(res.pagination);
      if (res.stats) setStats(res.stats);
    } catch (err: any) {
      console.error("Error in loadBuses:", err);
      setError(err?.message || "Không thể tải danh sách xe");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, type, status, page, limit]);

  useEffect(() => {
    loadBuses();
  }, [loadBuses]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleCreate = async (payload: BusFormValues) => {
    setActionLoading(true);
    try {
      const res = await busService.createBus(payload);
      resetFilters();
      await loadBuses();
      return { success: true, message: res.message || "Thêm xe mới thành công!" };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || "Có lỗi xảy ra khi thêm xe",
      };
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (id: string, payload: BusFormValues) => {
    setActionLoading(true);
    try {
      const res = await busService.updateBus(id, payload);
      await loadBuses();
      return { success: true, message: res.message || "Cập nhật xe thành công!" };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || "Có lỗi xảy ra khi cập nhật",
      };
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await busService.deleteBus(id);
      await loadBuses();
      return { success: true, message: res.message || "Xóa xe thành công!" };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || "Có lỗi xảy ra khi xóa xe",
      };
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeStatus = async (id: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await busService.changeBusStatus(id, newStatus);
      await loadBuses();
      return {
        success: true,
        message: res.message || `Đã chuyển trạng thái xe sang "${newStatus}"!`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || "Không thể cập nhật trạng thái",
      };
    } finally {
      setActionLoading(false);
    }
  };

  return {
    buses,
    stats,
    pagination,
    loading,
    actionLoading,
    error,
    filters: {
      search,
      type,
      status,
      page,
      limit,
    },
    setSearch: handleSearchChange,
    setType: handleTypeChange,
    setStatus: handleStatusChange,
    setPage,
    setLimit,
    resetFilters,
    refresh: loadBuses,
    createBus: handleCreate,
    updateBus: handleUpdate,
    deleteBus: handleDelete,
    changeStatus: handleChangeStatus,
  };
}
