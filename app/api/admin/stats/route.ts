import { NextResponse } from "next/server";
import { getDashboardStats } from "@/services/dashboardService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/admin/stats - Thống kê tổng hợp cho Admin Dashboard
export async function GET() {
  try {
    const stats = await getDashboardStats();

    return NextResponse.json({
      success: true,
      data: stats,
      message: "Lấy thống kê hệ thống thành công",
    });
  } catch (error) {
    console.error("Lỗi khi tổng hợp thống kê dashboard:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi tải dữ liệu thống kê" },
      { status: 500 }
    );
  }
}
