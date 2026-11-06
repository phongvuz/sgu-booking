import { parseVietnamDateTime } from "@/lib/trip-search";
import { z } from "zod";
import { tripStatuses } from "@/lib/trip-status";

export const tripSchema = z.object({
  status: z.enum(tripStatuses).default("DRAFT"),
  busId: z.string().trim().max(191).nullish().transform((value) => value || null),
  driverId: z.string().trim().max(191).nullish().transform((value) => value || null),
  endsAt: z.string().nullish().transform((value) => value || null).refine((value) => !value || !Number.isNaN(parseVietnamDateTime(value).getTime()), "Giờ kết thúc không hợp lệ"),
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
    .min(10000, "Giá vé tối thiểu 10.000 đ")
    .max(10000000, "Giá vé không hợp lệ"),
  capacity: z.coerce
    .number()
    .int("Sức chứa phải là số nguyên")
    .min(1, "Sức chứa phải từ 1 trở lên")
    .max(60, "Số ghế tối đa 60"),
}).refine((data) => data.from.toLocaleLowerCase("vi") !== data.to.toLocaleLowerCase("vi"), { message: "Điểm đi và điểm đến phải khác nhau.", path: ["to"] });

export type TripFormValues = z.infer<typeof tripSchema>;
