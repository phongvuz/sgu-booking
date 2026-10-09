"use client";

import { useCallback, useState } from "react";
import type { BusQueryParams, BusListResponse } from "@/types";
import type { BusFormValues } from "@/lib/validations/bus";
import * as service from "@/services/clientBusService";
import { useDebouncedSearch } from "./useDebouncedSearch";
import { useRemoteData } from "./useRemoteData";
import { useAsyncAction } from "./useAsyncAction";

const INITIAL_DATA: BusListResponse = {
  success: true,
  data: [],
  pagination: { page: 1, limit: 8, total: 0, totalPages: 1 },
  stats: { total: 0, active: 0, maintenance: 0, inactive: 0 },
};

export function useBuses(initialParams?: BusQueryParams) {
  const [page, setPage] = useState(initialParams?.page ?? 1);
  const [limit, setLimit] = useState(initialParams?.limit ?? 8);
  const [type, setType] = useState(initialParams?.type ?? "");
  const [status, setStatus] = useState(initialParams?.status ?? "");
  const resetPage = useCallback(() => setPage(1), []);
  const { search, appliedSearch, changeSearch, resetSearch } = useDebouncedSearch(initialParams?.search ?? "", resetPage);
  const { actionLoading, runAction } = useAsyncAction();

  const load = useCallback((signal: AbortSignal) => service.fetchBuses({
    search: appliedSearch, type, status, page, limit,
  }, signal), [appliedSearch, type, status, page, limit]);
  const { data, loading, error, refresh } = useRemoteData(load, INITIAL_DATA);

  function resetFilters() {
    resetSearch();
    setType("");
    setStatus("");
    setPage(1);
  }

  function filterType(value: string) {
    setType(value);
    setPage(1);
  }

  function filterStatus(value: string) {
    setStatus(value);
    setPage(1);
  }

  function createBus(payload: BusFormValues) {
    return runAction(async () => {
      const response = await service.createBus(payload);
      resetFilters();
      refresh();
      return response.message || "Thêm xe mới thành công!";
    });
  }

  function updateBus(id: string, payload: BusFormValues) {
    return runAction(async () => {
      const response = await service.updateBus(id, payload);
      refresh();
      return response.message || "Cập nhật xe thành công!";
    });
  }

  function deleteBus(id: string) {
    return runAction(async () => {
      const response = await service.deleteBus(id);
      refresh();
      return response.message || "Xóa xe thành công!";
    });
  }

  function changeStatus(id: string, status: string) {
    return runAction(async () => {
      const response = await service.changeBusStatus(id, status);
      refresh();
      return response.message || "Cập nhật trạng thái xe thành công!";
    });
  }

  return {
    buses: data.data,
    stats: data.stats,
    pagination: data.pagination,
    loading, error, actionLoading,
    filters: { search, type, status, page, limit },
    setSearch: changeSearch,
    setType: filterType,
    setStatus: filterStatus,
    setPage, setLimit, resetFilters, refresh,
    createBus, updateBus, deleteBus, changeStatus,
  };
}
