"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { TripQueryParams, PaginationMeta } from "@/types";
import { TripAdminItem, TripStats } from "@/services/tripService";
import { TripFormValues } from "@/lib/validations/trip";
import * as tripService from "@/services/clientTripService";

export function useTrips(initialParams?: TripQueryParams) {
  const [trips, setTrips] = useState<TripAdminItem[]>([]);
  const [stats, setStats] = useState<TripStats>({
    total: 0,
    departingToday: 0,
    totalBookings: 0,
    avgOccupancy: 0,
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
  const [from, setFrom] = useState<string>(initialParams?.from || "");
  const [to, setTo] = useState<string>(initialParams?.to || "");
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

  const handleFromChange = (val: string) => {
    setFrom(val);
    setPage(1);
  };

  const handleToChange = (val: string) => {
    setTo(val);
    setPage(1);
  };

  const handleDateChange = (val: string) => {
    setDate(val);
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setFrom("");
    setTo("");
    setDate("");
    setPage(1);
  };

  const loadTrips = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await tripService.fetchAdminTrips({
        search: debouncedSearch,
        from,
        to,
        date,
        page,
        limit,
      });

      setTrips(res.data);
      setPagination(res.pagination);
      if (res.stats) setStats(res.stats);
    } catch (err: any) {
      console.error("Error in loadTrips:", err);
      setError(err?.message || "Không thể tải danh sách chuyến xe");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, from, to, date, page, limit]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleCreate = async (payload: TripFormValues) => {
    setActionLoading(true);
    try {
      const res = await tripService.createTrip(payload);
      resetFilters();
      await loadTrips();
      return { success: true, message: res.message || "Tạo chuyến xe thành công!" };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || "Có lỗi xảy ra khi tạo chuyến xe",
      };
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (id: number | string, payload: Partial<TripFormValues>) => {
    setActionLoading(true);
    try {
      const res = await tripService.updateTrip(id, payload);
      await loadTrips();
      return { success: true, message: res.message || "Cập nhật chuyến xe thành công!" };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || "Có lỗi xảy ra khi cập nhật",
      };
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    setActionLoading(true);
    try {
      const res = await tripService.deleteTrip(id);
      await loadTrips();
      return { success: true, message: res.message || "Xóa chuyến xe thành công!" };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || "Có lỗi xảy ra khi xóa chuyến xe",
      };
    } finally {
      setActionLoading(false);
    }
  };

  return {
    trips,
    stats,
    pagination,
    loading,
    actionLoading,
    error,
    filters: {
      search,
      from,
      to,
      date,
      page,
      limit,
    },
    setSearch: handleSearchChange,
    setFrom: handleFromChange,
    setTo: handleToChange,
    setDate: handleDateChange,
    setPage,
    setLimit,
    resetFilters,
    refresh: loadTrips,
    createTrip: handleCreate,
    updateTrip: handleUpdate,
    deleteTrip: handleDelete,
  };
}
