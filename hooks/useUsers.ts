"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { UserAccount, UserQueryParams, PaginationMeta, UserStats } from "@/types";
import { UserFormValues } from "@/lib/validations/user";
import * as userService from "@/services/clientUserService";

export function useUsers(initialParams?: UserQueryParams) {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    users: 0,
    admins: 0,
    newThisMonth: 0,
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
  const [role, setRole] = useState<string>(initialParams?.role || "");
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

  const handleRoleChange = (val: string) => {
    setRole(val);
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setRole("");
    setPage(1);
  };

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await userService.fetchAdminUsers({
        search: debouncedSearch,
        role,
        page,
        limit,
      });

      setUsers(res.data);
      setPagination(res.pagination);
      if (res.stats) setStats(res.stats);
    } catch (err: any) {
      console.error("Error in loadUsers:", err);
      setError(err?.message || "Không thể tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, role, page, limit]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleCreate = async (payload: UserFormValues) => {
    setActionLoading(true);
    try {
      const res = await userService.createUser(payload);
      resetFilters();
      await loadUsers();
      return { success: true, message: res.message || "Tạo người dùng thành công!" };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || "Có lỗi xảy ra khi tạo người dùng",
      };
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (id: number | string, payload: Partial<UserFormValues>) => {
    setActionLoading(true);
    try {
      const res = await userService.updateUser(id, payload);
      await loadUsers();
      return { success: true, message: res.message || "Cập nhật người dùng thành công!" };
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
      const res = await userService.deleteUser(id);
      await loadUsers();
      return { success: true, message: res.message || "Xóa người dùng thành công!" };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || "Có lỗi xảy ra khi xóa người dùng",
      };
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeRole = async (id: number | string, newRole: "USER" | "ADMIN") => {
    setActionLoading(true);
    try {
      const res = await userService.changeUserRole(id, newRole);
      await loadUsers();
      return {
        success: true,
        message: res.message || `Đã chuyển vai trò người dùng sang "${newRole}"!`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || "Không thể cập nhật quyền",
      };
    } finally {
      setActionLoading(false);
    }
  };

  return {
    users,
    stats,
    pagination,
    loading,
    actionLoading,
    error,
    filters: {
      search,
      role,
      page,
      limit,
    },
    setSearch: handleSearchChange,
    setRole: handleRoleChange,
    setPage,
    setLimit,
    resetFilters,
    refresh: loadUsers,
    createUser: handleCreate,
    updateUser: handleUpdate,
    deleteUser: handleDelete,
    changeRole: handleChangeRole,
  };
}
