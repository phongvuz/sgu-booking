"use client";

import React, { useState } from "react";
import { ToastProvider, useToast } from "@/components/admin/employees/Toast";
import { useEmployees } from "@/hooks/useEmployees";
import { EmployeeTable } from "@/components/admin/employees/EmployeeTable";
import { EmployeeFilters } from "@/components/admin/employees/EmployeeFilters";
import { EmployeePagination } from "@/components/admin/employees/EmployeePagination";
import { EmployeeModal } from "@/components/admin/employees/EmployeeModal";
import { DeleteConfirmModal } from "@/components/admin/employees/DeleteConfirmModal";
import { EmployeeDetailModal } from "@/components/admin/employees/EmployeeDetailModal";
import { EmployeeStats } from "@/components/admin/employees/EmployeeStats";
import { Employee } from "@/types";
import { EmployeeFormValues } from "@/lib/validations/employee";

function AdminEmployeesContent() {
  const {
    employees,
    pagination,
    loading,
    error,
    filters,
    setSearch,
    setRole,
    setStatus,
    setPage,
    setLimit,
    resetFilters,
    refresh,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    changeStatus,
  } = useEmployees({ limit: 8 });

  const { success, error: toastError, info } = useToast();

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Open Create Modal
  const handleOpenCreate = () => {
    setSelectedEmployee(null);
    setFormMode("create");
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (emp: Employee) => {
    setSelectedEmployee(emp);
    setFormMode("edit");
    setIsFormModalOpen(true);
  };

  // Open Delete / Deactivate Modal
  const handleOpenDelete = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsDeleteModalOpen(true);
  };

  // Open Details Modal
  const handleOpenDetail = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsDetailModalOpen(true);
  };

  // Handle Form Submit (Create or Update)
  const handleFormSubmit = async (data: EmployeeFormValues) => {
    if (formMode === "create") {
      const res = await createEmployee(data);
      if (res.success) {
        success(res.message || "Đã thêm nhân viên thành công!", "Thêm mới");
        return { success: true };
      } else {
        toastError(res.message || "Không thể thêm nhân viên", "Lỗi tạo mới");
        return { success: false, message: res.message };
      }
    } else if (selectedEmployee) {
      const res = await updateEmployee(selectedEmployee.id, data);
      if (res.success) {
        success(res.message || "Cập nhật nhân viên thành công!", "Cập nhật");
        return { success: true };
      } else {
        toastError(res.message || "Không thể cập nhật nhân viên", "Lỗi cập nhật");
        return { success: false, message: res.message };
      }
    }
    return { success: false };
  };

  // Handle Confirm Permanent Delete
  const handleConfirmDelete = async (id: string) => {
    const res = await deleteEmployee(id);
    if (res.success) {
      success(res.message || "Đã xóa nhân viên thành công!", "Đã xóa");
      return { success: true };
    } else {
      toastError(res.message || "Không thể xóa nhân viên", "Lỗi xóa");
      return { success: false, message: res.message };
    }
  };

  // Handle Confirm Deactivate
  const handleConfirmDeactivate = async (id: string) => {
    const res = await changeStatus(id, "Đã nghỉ việc");
    if (res.success) {
      info(res.message || "Đã chuyển trạng thái sang Đã nghỉ việc", "Đã cập nhật");
      return { success: true };
    } else {
      toastError(res.message || "Không thể cập nhật trạng thái", "Lỗi");
      return { success: false, message: res.message };
    }
  };

  return (
    <div className="pb-12">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <span>Quản lý Nhân sự</span>
            <span className="text-xs bg-orange-100 text-[#ef5222] font-semibold px-2.5 py-0.5 rounded-full">
              {pagination.total} nhân viên
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Quản lý danh sách tài xế, phụ xe, nhân viên điều hành và văn phòng
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refresh()}
            disabled={loading}
            className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg shadow-sm transition-colors text-sm font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Làm mới dữ liệu"
          >
            <span className={loading ? "animate-spin" : ""}>🔄</span>
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="bg-[#ef5222] hover:bg-[#d94a1d] text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm hover:shadow flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <span className="text-base font-bold">+</span>
            <span>Thêm nhân viên mới</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Overview */}
      <EmployeeStats employees={employees} total={pagination.total} />

      {/* Error Banner if any */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
          <button
            onClick={() => refresh()}
            className="text-xs font-semibold text-rose-800 underline hover:no-underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filter Toolbar */}
        <EmployeeFilters
          search={filters.search}
          onSearchChange={setSearch}
          role={filters.role}
          onRoleChange={setRole}
          status={filters.status}
          onStatusChange={setStatus}
          onReset={resetFilters}
        />

        {/* Employees Table */}
        <EmployeeTable
          employees={employees}
          loading={loading}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onView={handleOpenDetail}
          onToggleStatus={(emp) => {
            const nextStatus =
              emp.status === "Đang làm việc"
                ? "Nghỉ phép"
                : emp.status === "Nghỉ phép"
                ? "Đã nghỉ việc"
                : "Đang làm việc";
            changeStatus(emp.id, nextStatus);
          }}
        />

        {/* Pagination Toolbar */}
        <EmployeePagination
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>

      {/* Modal: Create & Edit Employee */}
      <EmployeeModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedEmployee}
        mode={formMode}
      />

      {/* Modal: Confirm Delete / Deactivate */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        employee={selectedEmployee}
        onConfirmDelete={handleConfirmDelete}
        onConfirmDeactivate={handleConfirmDeactivate}
      />

      {/* Modal: Employee Profile Detail */}
      <EmployeeDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        employee={selectedEmployee}
        onEdit={(emp) => handleOpenEdit(emp)}
      />
    </div>
  );
}

export default function AdminEmployeesPage() {
  return (
    <ToastProvider>
      <AdminEmployeesContent />
    </ToastProvider>
  );
}
