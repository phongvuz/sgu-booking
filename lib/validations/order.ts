import { z } from "zod";

export const offlineOrderSchema = z.object({
  tripId: z.coerce.number().min(1, "Vui lòng chọn chuyến xe"),
  seats: z.array(z.string().min(1)).min(1, "Vui lòng chọn ít nhất 1 ghế"),
  fullName: z
    .string()
    .trim()
    .min(2, "Họ tên khách hàng tối thiểu 2 ký tự")
    .max(100, "Họ tên khách hàng tối đa 100 ký tự"),
  phone: z
    .string()
    .trim()
    .regex(
      /^(0|\+84)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/,
      "Số điện thoại không hợp lệ (VD: 0901234567)"
    ),
  status: z.enum(["CONFIRMED", "PENDING", "CANCELLED"]).default("CONFIRMED"),
});

export type OfflineOrderFormValues = z.infer<typeof offlineOrderSchema>;
