"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { FiX } from "react-icons/fi";
import { formatDepartureDate, formatVietnamDateTime } from "@/lib/trip-search";
import { tripSchema } from "@/lib/validations/trip";
import type { TripFormValues } from "@/lib/validations/trip";
import type { TripAdminItem } from "@/types/trip";

interface TripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TripFormValues) => Promise<{ success: boolean; message?: string }>;
  initialData?: TripAdminItem | null;
  mode: "create" | "edit";
}

export function TripModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: TripModalProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [defaultValues] = useState(() => {
    if (mode === "edit" && initialData) {
      return {
        from: initialData.from,
        to: initialData.to,
        time: formatVietnamDateTime(initialData.time),
        price: initialData.price,
        capacity: initialData.totalSeats,
      };
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      from: "",
      to: "",
      time: formatDepartureDate(tomorrow) + "T08:00",
      price: 300000,
      capacity: 30,
    };
  });

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    const result = tripSchema.safeParse({
      from: formData.get("from"),
      to: formData.get("to"),
      time: formData.get("time"),
      price: formData.get("price"),
      capacity: formData.get("capacity"),
    });

    setErrors({});
    setSubmitError("");

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = String(issue.path[0]);
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    const data = result.data;
    if (mode === "edit" && initialData && data.time === defaultValues.time) {
      data.time = initialData.time;
    }

    setIsSubmitting(true);
    try {
      const response = await onSubmit(data);
      if (response.success) {
        onClose();
      } else {
        setSubmitError(response.message || "Không thể lưu chuyến xe. Vui lòng thử lại.");
      }
    } catch {
      setSubmitError("Không thể lưu chuyến xe. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  let title = "Thêm chuyến xe mới";
  let submitLabel = "Tạo chuyến xe";
  if (mode === "edit") {
    title = "Cập nhật chuyến " + initialData?.id;
    submitLabel = "Cập nhật chuyến xe";
  }
  if (isSubmitting) {
    submitLabel = "Đang lưu...";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-900 text-base">
              {title}
            </h3>
            <p className="text-xs text-gray-500">
              Thiết lập lộ trình điểm đi, điểm đến, giờ xuất bến và giá vé
            </p>
          </div>
          <button
            type="button"
            aria-label="Đóng"
            disabled={isSubmitting}
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg p-1 rounded"
          >
            <FiX aria-hidden="true" className="inline-block shrink-0 align-middle" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} noValidate className="p-6 overflow-y-auto space-y-4 flex-1">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="trip-from" className="block text-xs font-semibold text-gray-700 mb-1">
                Điểm khởi hành <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: Hồ Chí Minh"
                id="trip-from"
                name="from"
                defaultValue={defaultValues.from}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
              {errors.from && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.from}</p>
              )}
            </div>

            <div>
              <label htmlFor="trip-to" className="block text-xs font-semibold text-gray-700 mb-1">
                Điểm đến <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: Đà Lạt"
                id="trip-to"
                name="to"
                defaultValue={defaultValues.to}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
              {errors.to && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.to}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="trip-time" className="block text-xs font-semibold text-gray-700 mb-1">
              Thời gian xuất bến <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="trip-time"
              name="time"
              defaultValue={defaultValues.time}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            />
            {errors.time && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.time}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="trip-price" className="block text-xs font-semibold text-gray-700 mb-1">
                Giá vé (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="10000"
                placeholder="300000"
                id="trip-price"
                name="price"
                defaultValue={defaultValues.price}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
              {errors.price && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label htmlFor="trip-capacity" className="block text-xs font-semibold text-gray-700 mb-1">
                Sức chứa chuyến xe <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                id="trip-capacity"
                name="capacity"
                defaultValue={defaultValues.capacity}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
              {errors.capacity && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.capacity}</p>
              )}
            </div>
          </div>

          {submitError && <p role="alert" className="text-xs text-rose-600">{submitError}</p>}

          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
