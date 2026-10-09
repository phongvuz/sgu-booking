"use client";

import { useCallback, useState } from "react";
import type { UserQueryParams, UserListResponse } from "@/types";
import type { UserFormValues } from "@/lib/validations/user";
import * as service from "@/services/clientUserService";
import { useDebouncedSearch } from "./useDebouncedSearch";
import { useRemoteData } from "./useRemoteData";
import { useAsyncAction } from "./useAsyncAction";

const INITIAL_DATA: UserListResponse = {
  success: true,
  data: [],
  pagination: { page: 1, limit: 8, total: 0, totalPages: 1 },
  stats: { total: 0, users: 0, admins: 0, newThisMonth: 0 },
};

export function useUsers(initialParams?: UserQueryParams) {
  const [page, setPage] = useState(initialParams?.page ?? 1);
  const [limit, setLimit] = useState(initialParams?.limit ?? 8);
  const [role, setRole] = useState(initialParams?.role ?? "");
  const resetPage = useCallback(() => setPage(1), []);
  const { search, appliedSearch, changeSearch, resetSearch } = useDebouncedSearch(initialParams?.search ?? "", resetPage);
  const { actionLoading, runAction } = useAsyncAction();

  const load = useCallback((signal: AbortSignal) => service.fetchAdminUsers({
    search: appliedSearch, role, page, limit,
  }, signal), [appliedSearch, role, page, limit]);
  const { data, loading, error, refresh } = useRemoteData(load, INITIAL_DATA);

  function resetFilters() {
    resetSearch();
    setRole("");
    setPage(1);
  }

  function filterRole(value: string) {
    setRole(value);
    setPage(1);
  }

  function createUser(payload: UserFormValues) {
    return runAction(async () => {
      const response = await service.createUser(payload);
      resetFilters();
      refresh();
      return response.message || "Tạo người dùng thành công!";
    });
  }

  function updateUser(id: number | string, payload: Partial<UserFormValues>) {
    return runAction(async () => {
      const response = await service.updateUser(id, payload);
      refresh();
      return response.message || "Cập nhật người dùng thành công!";
    });
  }

  function deleteUser(id: number | string) {
    return runAction(async () => {
      const response = await service.deleteUser(id);
      refresh();
      return response.message || "Xóa người dùng thành công!";
    });
  }

  function changeRole(id: number | string, role: "USER" | "ADMIN") {
    return runAction(async () => {
      const response = await service.changeUserRole(id, role);
      refresh();
      return response.message || "Cập nhật quyền thành công!";
    });
  }

  return {
    users: data.data,
    stats: data.stats,
    pagination: data.pagination,
    loading, error, actionLoading,
    filters: { search, role, page, limit },
    setSearch: changeSearch,
    setRole: filterRole,
    setPage, setLimit, resetFilters, refresh,
    createUser, updateUser, deleteUser, changeRole,
  };
}
