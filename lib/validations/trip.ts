import { z } from "zod";

export const tripSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Mã chuyến xe phải từ 3 ký tự trở lên")
    .max(30, "Mã chuyến xe tối đa 30 ký tự")
    .regex(/^[A-Z0-9_-]+$/i, "Mã chuyến xe chỉ gồm chữ cái, số, gạch ngang (VD: SG-DL-01)")
    .optional()
    .or(z.literal("")),
  from: z
    .string()
    .trim()
    .min(2, "Điểm khởi hành không được để trống"),
  to: z
    .string()
    .trim()
    .min(2, "Điểm đến không được để trống"),
  time: z
    .string()
    .min(1, "Vui lòng chọn thời gian xuất bến"),
  price: z.coerce
    .number()
    .min(10000, "Giá vé tối thiểu 10.000 đ")
    .max(10000000, "Giá vé không hợp lệ"),
  availableSeats: z.coerce
    .number()
    .min(1, "Số ghế trống phải từ 1 trở lên")
    .max(60, "Số ghế tối đa 60"),
});

export type TripFormValues = z.infer<typeof tripSchema>;
