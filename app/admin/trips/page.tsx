"use client";

import React, { useState } from "react";
import { useToast } from "@/components/admin/Toast";
import { useTrips } from "@/hooks/useTrips";
import { TripTable } from "@/components/admin/trips/TripTable";
import { TripFilters } from "@/components/admin/trips/TripFilters";
import { TripStats } from "@/components/admin/trips/TripStats";
import { TripModal } from "@/components/admin/trips/TripModal";
import { TripDetailModal } from "@/components/admin/trips/TripDetailModal";
import { DeleteTripModal } from "@/components/admin/trips/DeleteTripModal";
import { EmployeePagination } from "@/components/admin/employees/EmployeePagination";
import { TripAdminItem } from "@/services/tripService";
import { TripFormValues } from "@/lib/validations/trip";

export default function AdminTripsPage() {
  const {
    trips,
    stats,
    pagination,
    loading,
    error,
    filters,
    setSearch,
    setFrom,
    setTo,
    setDate,
    setPage,
    setLimit,
    resetFilters,
    refresh,
    createTrip,
    updateTrip,
    deleteTrip,
  } = useTrips({ limit: 8 });

  const { success, error: toastError } = useToast();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedTrip, setSelectedTrip] = useState<TripAdminItem | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleOpenCreate = () => {
    setSelectedTrip(null);
    setFormMode("create");
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (trip: TripAdminItem) => {
    setSelectedTrip(trip);
    setFormMode("edit");
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (trip: TripAdminItem) => {
    setSelectedTrip(trip);
    setIsDeleteModalOpen(true);
  };

  const handleOpenDetail = (trip: TripAdminItem) => {
    setSelectedTrip(trip);
    setIsDetailModalOpen(true);
  };

  const handleFormSubmit = async (data: TripFormValues) => {
    if (formMode === "create") {
      const res = await createTrip(data);
      if (res.success) {
        success(res.message || "Tạo chuyến xe mới thành công!", "Thêm chuyến");
        return { success: true };
      } else {
        toastError(res.message || "Không thể tạo chuyến xe", "Lỗi tạo mới");
        return { success: false, message: res.message };
      }
    } else if (selectedTrip) {
      const res = await updateTrip(selectedTrip.id, data);
      if (res.success) {
        success(res.message || "Cập nhật chuyến xe thành công!", "Cập nhật");
        return { success: true };
      } else {
        toastError(res.message || "Không thể cập nhật chuyến xe", "Lỗi");
        return { success: false, message: res.message };
      }
    }
    return { success: false };
  };

  const handleConfirmDelete = async (id: number) => {
    const res = await deleteTrip(id);
    if (res.success) {
      success(res.message || "Đã xóa chuyến xe thành công!", "Đã xóa");
      return { success: true };
    } else {
      toastError(res.message || "Không thể xóa chuyến xe", "Lỗi xóa");
      return { success: false, message: res.message };
    }
  };

  return (
    <div className="pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>Quản lý Tuyến & Chuyến xe</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
              {pagination.total} chuyến
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Điều phối lịch trình xe xuất bến, giá vé niêm yết, số ghế mở bán và tỷ lệ lấp đầy
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
            className="bg-[#1a9e09] hover:bg-[#1db63e] text-white px-4 py-2.5 rounded-lg font-bold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <span className="text-base font-bold">+</span>
            <span>Thêm chuyến xe mới</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <TripStats stats={stats} />

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
        <TripFilters
          search={filters.search}
          onSearchChange={setSearch}
          from={filters.from}
          onFromChange={setFrom}
          to={filters.to}
          onToChange={setTo}
          date={filters.date}
          onDateChange={setDate}
          onReset={resetFilters}
        />

        {/* Table */}
        <TripTable
          trips={trips}
          loading={loading}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onView={handleOpenDetail}
        />

        {/* Pagination */}
        <EmployeePagination
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>

      {/* Modals */}
      <TripModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedTrip}
        mode={formMode}
      />

      <TripDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        trip={selectedTrip}
        onEdit={(trip) => handleOpenEdit(trip)}
      />

      <DeleteTripModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        trip={selectedTrip}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
