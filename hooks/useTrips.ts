"use client";

import { useCallback, useState } from "react";
import type { TripQueryParams, TripListAdminResponse } from "@/types";
import type { TripFormValues } from "@/lib/validations/trip";
import * as service from "@/services/clientTripService";
import { useDebouncedSearch } from "./useDebouncedSearch";
import { useRemoteData } from "./useRemoteData";
import { useAsyncAction } from "./useAsyncAction";

const INITIAL_DATA: TripListAdminResponse = {
  success: true,
  data: [],
  pagination: { page: 1, limit: 8, total: 0, totalPages: 1 },
  stats: { total: 0, departingToday: 0, totalBookings: 0, avgOccupancy: 0 },
};

export function useTrips(initialParams?: TripQueryParams) {
  const [page, setPage] = useState(initialParams?.page ?? 1);
  const [limit, setLimit] = useState(initialParams?.limit ?? 8);
  const [from, setFrom] = useState(initialParams?.from ?? "");
  const [to, setTo] = useState(initialParams?.to ?? "");
  const [date, setDate] = useState(initialParams?.date ?? "");
  const resetPage = useCallback(() => setPage(1), []);
  const { search, appliedSearch, changeSearch, resetSearch } = useDebouncedSearch(initialParams?.search ?? "", resetPage);
  const { actionLoading, runAction } = useAsyncAction();

  const load = useCallback((signal: AbortSignal) => service.fetchAdminTrips({
    search: appliedSearch, from, to, date, page, limit,
  }, signal), [appliedSearch, from, to, date, page, limit]);
  const { data, loading, error, refresh } = useRemoteData(load, INITIAL_DATA);

  function resetFilters() {
    resetSearch();
    setFrom("");
    setTo("");
    setDate("");
    setPage(1);
  }

  function filterFrom(value: string) {
    setFrom(value);
    setPage(1);
  }

  function filterTo(value: string) {
    setTo(value);
    setPage(1);
  }

  function filterDate(value: string) {
    setDate(value);
    setPage(1);
  }

  function createTrip(payload: TripFormValues) {
    return runAction(async () => {
      const response = await service.createTrip(payload);
      resetFilters();
      refresh();
      return response.message || "Tạo chuyến xe thành công!";
    });
  }

  function updateTrip(id: number, payload: Partial<TripFormValues>) {
    return runAction(async () => {
      const response = await service.updateTrip(id, payload);
      refresh();
      return response.message || "Cập nhật chuyến xe thành công!";
    });
  }

  function deleteTrip(id: number) {
    return runAction(async () => {
      const response = await service.deleteTrip(id);
      refresh();
      return response.message || "Xóa chuyến xe thành công!";
    });
  }

  return {
    trips: data.data,
    stats: data.stats,
    pagination: data.pagination,
    loading, error, actionLoading,
    filters: { search, from, to, date, page, limit },
    setSearch: changeSearch,
    setFrom: filterFrom,
    setTo: filterTo,
    setDate: filterDate,
    setPage, setLimit, resetFilters, refresh,
    createTrip, updateTrip, deleteTrip,
  };
}
