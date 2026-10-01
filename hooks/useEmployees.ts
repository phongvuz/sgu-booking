"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Employee, PaginationMeta, EmployeeQueryParams } from "@/types";
import { EmployeeFormValues } from "@/lib/validations/employee";
import * as employeeService from "@/services/employeeService";

export function useEmployees(initialParams?: EmployeeQueryParams) {
  const [employees, setEmployees] = useState<Employee[]>([]);
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
  const [department, setDepartment] = useState<string>(initialParams?.department || "");
  const [status, setStatus] = useState<string>(initialParams?.status || "");
  const [page, setPage] = useState<number>(initialParams?.page || 1);
  const [limit, setLimit] = useState<number>(initialParams?.limit || 8);

  // Debounce search input (350ms)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1); // Reset to page 1 on new search
    }, 350);
  };

  const handleRoleChange = (val: string) => {
    setRole(val);
    setPage(1);
  };

  const handleDepartmentChange = (val: string) => {
    setDepartment(val);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setRole("");
    setDepartment("");
    setStatus("");
    setPage(1);
  };

  // Fetch employees list
  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await employeeService.fetchEmployees({
        search: debouncedSearch,
        role,
        department,
        status,
        page,
        limit,
      });

      setEmployees(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      console.error("Error in loadEmployees:", err);
      setError(err?.message || "Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, role, department, status, page, limit]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  // Action: Create employee
  const handleCreate = async (payload: EmployeeFormValues) => {
    setActionLoading(true);
    try {
      const res = await employeeService.createEmployee(payload);

      // Immediately reset filters and go to page 1 so new employee is right at the top
      setSearch("");
      setDebouncedSearch("");
      setRole("");
      setDepartment("");
      setStatus("");
      setPage(1);

      // Immediately update local state with newly created employee
      if (res.data) {
        setEmployees((prev) => [res.data, ...prev.filter((e) => e.id !== res.data.id)]);
        setPagination((prev) => ({
          ...prev,
          page: 1,
          total: prev.total + 1,
          totalPages: Math.max(1, Math.ceil((prev.total + 1) / prev.limit)),
        }));
      }

      await loadEmployees();
      return { success: true, message: res.message || "Tạo nhân viên thành công!" };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || "Có lỗi xảy ra khi tạo nhân viên",
      };
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Update employee
  const handleUpdate = async (id: string, payload: EmployeeFormValues) => {
    setActionLoading(true);
    try {
      const res = await employeeService.updateEmployee(id, payload);

      // Immediately update local state
      if (res.data) {
        setEmployees((prev) =>
          prev.map((e) => (e.id.toLowerCase() === id.toLowerCase() ? res.data : e))
        );
      }

      await loadEmployees();
      return { success: true, message: res.message || "Cập nhật nhân viên thành công!" };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || "Có lỗi xảy ra khi cập nhật",
      };
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Delete employee
  const handleDelete = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await employeeService.deleteEmployee(id);

      // Immediately remove from local state
      setEmployees((prev) => prev.filter((e) => e.id.toLowerCase() !== id.toLowerCase()));
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        totalPages: Math.max(1, Math.ceil((prev.total - 1) / prev.limit)),
      }));

      await loadEmployees();
      return { success: true, message: res.message || "Xóa nhân viên thành công!" };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || "Có lỗi xảy ra khi xóa nhân viên",
      };
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Toggle or change status
  const handleChangeStatus = async (id: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await employeeService.changeEmployeeStatus(id, newStatus);

      // Immediately update status in local state
      if (res.data) {
        setEmployees((prev) =>
          prev.map((e) => (e.id.toLowerCase() === id.toLowerCase() ? res.data : e))
        );
      }

      await loadEmployees();
      return {
        success: true,
        message: res.message || `Đã chuyển trạng thái sang "${newStatus}"!`,
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
    employees,
    pagination,
    loading,
    actionLoading,
    error,
    filters: {
      search,
      role,
      department,
      status,
      page,
      limit,
    },
    setSearch: handleSearchChange,
    setRole: handleRoleChange,
    setDepartment: handleDepartmentChange,
    setStatus: handleStatusChange,
    setPage,
    setLimit,
    resetFilters,
    refresh: loadEmployees,
    createEmployee: handleCreate,
    updateEmployee: handleUpdate,
    deleteEmployee: handleDelete,
    changeStatus: handleChangeStatus,
  };
}
