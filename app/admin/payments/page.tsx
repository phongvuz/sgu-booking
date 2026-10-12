import Link from "next/link";
import { requireAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { readOption } from "@/lib/query-params";
import { paymentSortOptions } from "@/lib/admin-table-sort";
import { TableSortNavigation } from "@/components/admin/TableSortNavigation";
import type { Prisma } from "@prisma/client";

export const metadata = { title: "Thanh toán online | Quản trị" };

const labels: Record<string, string> = {
  PENDING: "Chờ thanh toán",
  SUCCESS: "Thành công",
  FAILED: "Thất bại / đã hủy",
  REVIEW: "Cần đối soát",
};
const PAGE_SIZE = 10;

interface PaymentsPageProps {
  searchParams: Promise<{
    page?: string;
    review?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}

function getStatusLabel(status: string, expiresAt: Date) {
  if (status === "PENDING" && expiresAt <= new Date()) {
    return "Hết hạn";
  }
  return labels[status] ?? status;
}

// Server Component: kiểm tra quyền và đọc database trên máy chủ.
export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  await requireAdmin();

  // Trong phiên bản Next.js này, searchParams là Promise nên cần await.
  const params = await searchParams;
  const sortBy = readOption(
    params.sortBy ?? null,
    ["createdAt", "amount", "pnr", "id"] as const,
    "createdAt",
  );
  const sortOrder = readOption(params.sortOrder ?? null, ["asc", "desc"] as const, "desc");
  const sort = { sortBy, sortOrder };

  const where: Prisma.PaymentWhereInput = {};
  if (params.review === "1") {
    where.status = "REVIEW";
  }

  const count = await prisma.payment.count({ where });
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const requestedPage = Number(params.page);
  let page = 1;
  if (Number.isInteger(requestedPage) && requestedPage > 0) {
    page = Math.min(requestedPage, pages);
  }

  const orderBy: Prisma.PaymentOrderByWithRelationInput = { [sortBy]: sortOrder };
  let paymentOrder: Prisma.PaymentOrderByWithRelationInput | Prisma.PaymentOrderByWithRelationInput[] = orderBy;
  if (sortBy !== "id") {
    // Khi hai giao dịch bằng nhau, dùng id để thứ tự phân trang ổn định.
    paymentOrder = [orderBy, { id: "desc" }];
  }
  const payments = await prisma.payment.findMany({
    where,
    orderBy: paymentOrder,
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
  });

  const query = new URLSearchParams({ sortBy, sortOrder });
  if (params.review === "1") {
    query.set("review", "1");
  }

  function pageLink(number: number) {
    const next = new URLSearchParams(query);
    next.set("page", String(number));
    return `/admin/payments?${next.toString()}`;
  }

  function filterLink(review: boolean) {
    const next = new URLSearchParams({ sortBy, sortOrder });
    if (review) {
      next.set("review", "1");
    }
    return `/admin/payments?${next.toString()}`;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Thanh toán online</h1>
      <p className="my-3 text-sm text-gray-600">VietQR Demo: giao dịch được tạo khi khách bấm “Tôi đã chuyển khoản”. Đây là xác nhận giả lập, chưa được ngân hàng kiểm chứng. Lịch sử cổng thanh toán cũ được giữ để đối chiếu.</p>
      <div className="mb-4 flex gap-5 text-sm font-semibold text-blue-700">
        <Link href={filterLink(false)}>Tất cả</Link>
        <Link href={filterLink(true)}>Cần đối soát</Link>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <TableSortNavigation
          pathname="/admin/payments"
          query={query.toString()}
          value={sort}
          options={paymentSortOptions}
        />
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              {["Mã đặt chỗ", "Số tiền", "Trạng thái", "Phương thức / Mã giao dịch", "Ngày tạo / xác nhận"].map((label) => (
                <th key={label} className="p-3">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-t">
                <td className="p-3">
                  <Link className="text-blue-700 underline" href={`/admin/orders?search=${encodeURIComponent(payment.pnr)}`}>
                    {payment.pnr}
                  </Link>
                  <p className="mt-1 break-all text-xs text-gray-500">{payment.id}</p>
                </td>
                <td className="whitespace-nowrap p-3">{payment.amount.toLocaleString("vi-VN")} đ</td>
                <td className={`p-3 font-semibold ${payment.status === "REVIEW" ? "text-red-700" : ""}`}>
                  {getStatusLabel(payment.status, payment.expiresAt)}
                </td>
                <td className="max-w-xs break-all p-3">
                  <p className="font-semibold">{payment.responseCode === "DEMO" ? "VietQR " : "Cổng thanh toán cũ"}</p>
                  {payment.providerTransactionId ?? "—"}
                </td>
                <td className="whitespace-nowrap p-3">
                  {formatDate(payment.createdAt)}
                  <p className="text-xs text-gray-500">{payment.paidAt ? formatDate(payment.paidAt) : "Chưa nhận thanh toán"}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && <p className="p-6 text-gray-500">Chưa có giao dịch.</p>}
      </div>
      <div className="mt-4 flex items-center gap-5 text-sm">
        <span>Trang {page}/{pages} · {count} giao dịch</span>
        {page > 1 && <Link href={pageLink(page - 1)} className="text-blue-700">Trang trước</Link>}
        {page < pages && <Link href={pageLink(page + 1)} className="text-blue-700">Trang sau</Link>}
      </div>
    </div>
  );
}
