"use client";

import React, { useState } from "react";
import { useToast } from "@/components/admin/Toast";
import { useUsers } from "@/hooks/useUsers";
import { UserTable } from "@/components/admin/users/UserTable";
import { UserFilters } from "@/components/admin/users/UserFilters";
import { UserStats } from "@/components/admin/users/UserStats";
import { UserModal } from "@/components/admin/users/UserModal";
import { UserDetailModal } from "@/components/admin/users/UserDetailModal";
import { DeleteUserModal } from "@/components/admin/users/DeleteUserModal";
import { EmployeePagination } from "@/components/admin/employees/EmployeePagination";
import { UserAccount } from "@/types";
import { UserFormValues } from "@/lib/validations/user";

export default function AdminUsersPage() {
  const {
    users,
    stats,
    pagination,
    loading,
    error,
    filters,
    setSearch,
    setRole,
    setPage,
    setLimit,
    resetFilters,
    refresh,
    createUser,
    updateUser,
    deleteUser,
    changeRole,
  } = useUsers({ limit: 8 });

  const { success, error: toastError, info } = useToast();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setFormMode("create");
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (user: UserAccount) => {
    setSelectedUser(user);
    setFormMode("edit");
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (user: UserAccount) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleOpenDetail = (user: UserAccount) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleFormSubmit = async (data: UserFormValues) => {
    if (formMode === "create") {
      const res = await createUser(data);
      if (res.success) {
        success(res.message || "Tạo tài khoản thành công!", "Tạo tài khoản");
        return { success: true };
      } else {
        toastError(res.message || "Không thể tạo tài khoản", "Lỗi");
        return { success: false, message: res.message };
      }
    } else if (selectedUser) {
      const res = await updateUser(selectedUser.id, data);
      if (res.success) {
        success(res.message || "Cập nhật tài khoản thành công!", "Cập nhật");
        return { success: true };
      } else {
        toastError(res.message || "Không thể cập nhật tài khoản", "Lỗi");
        return { success: false, message: res.message };
      }
    }
    return { success: false };
  };

  const handleConfirmDelete = async (id: number) => {
    const res = await deleteUser(id);
    if (res.success) {
      success(res.message || "Đã xóa tài khoản thành công!", "Đã xóa");
      return { success: true };
    } else {
      toastError(res.message || "Không thể xóa tài khoản", "Lỗi");
      return { success: false, message: res.message };
    }
  };

  const handleToggleRole = async (user: UserAccount) => {
    if (user.role === "USER") {
      handleOpenEdit(user);
      info("Chọn quyền ADMIN và nhập mật khẩu mới để cấp quyền quản trị.", "Phân quyền");
      return;
    }
    const nextRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    const res = await changeRole(user.id, nextRole);
    if (res.success) {
      info(res.message || `Đã chuyển vai trò sang ${nextRole}!`, "Phân quyền");
    } else {
      toastError(res.message || "Không thể đổi vai trò", "Lỗi");
    }
  };

  return (
    <div className="pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>Quản lý Khách hàng & Tài khoản</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
              {pagination.total} tài khoản
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Quản trị danh sách khách hàng đặt vé, tổng tiền tích lũy và phân quyền quản trị viên
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refresh()}
            disabled={loading}
            className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg shadow-2xs transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Làm mới dữ liệu"
          >
            <span className={loading ? "animate-spin" : ""}>🔄</span>
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="bg-brand-primary hover:bg-brand-dark text-white px-4 py-2.5 rounded-lg font-bold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <span className="text-base font-bold">+</span>
            <span>Thêm tài khoản mới</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <UserStats stats={stats} />

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button
            onClick={() => refresh()}
            className="font-bold underline hover:no-underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-2xs border border-gray-200 overflow-hidden">
        {/* Filters */}
        <UserFilters
          search={filters.search}
          onSearchChange={setSearch}
          role={filters.role}
          onRoleChange={setRole}
          onReset={resetFilters}
        />

        {/* Table */}
        <UserTable
          users={users}
          loading={loading}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onView={handleOpenDetail}
          onToggleRole={handleToggleRole}
        />

        {/* Pagination */}
        <EmployeePagination
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>

      {/* Modals */}
      <UserModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedUser}
        mode={formMode}
      />

      <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        user={selectedUser}
        onEdit={(user) => handleOpenEdit(user)}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        user={selectedUser}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
