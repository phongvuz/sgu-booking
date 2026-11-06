import { parseVietnamDateTime } from "@/lib/trip-search";
import { z } from "zod";

export const tripSchema = z.object({
  from: z
    .string()
    .trim()
    .min(2, "Điểm khởi hành không được để trống").max(191),
  to: z
    .string()
    .trim()
    .min(2, "Điểm đến không được để trống").max(191),
  time: z
    .string()
    .min(1, "Vui lòng chọn thời gian xuất bến")
    .refine((value) => !Number.isNaN(parseVietnamDateTime(value).getTime()), "Thời gian không hợp lệ"),
  price: z.coerce
    .number()
    .int("Giá vé phải là số nguyên đồng")
    .min(10000, "Giá vé tối thiểu 10.000 đ")
    .max(10000000, "Giá vé không hợp lệ"),
  busId: z.string().trim().min(1, "Vui lòng chọn xe cho chuyến").max(191),
}).refine((data) => data.from.toLocaleLowerCase("vi") !== data.to.toLocaleLowerCase("vi"), { message: "Điểm đi và điểm đến phải khác nhau.", path: ["to"] });

export type TripFormValues = z.infer<typeof tripSchema>;
