import { NextRequest, NextResponse } from "next/server";
import { queryBuses, createBus, checkBusPlateConflict } from "@/services/busService";
import { busSchema } from "@/lib/validations/bus";
import { BusQueryParams } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/buses - Lấy danh sách xe với tìm kiếm, lọc và phân trang
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params: BusQueryParams = {
      search: searchParams.get("search") || "",
      type: searchParams.get("type") || "",
      status: searchParams.get("status") || "",
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 8,
      sortBy: (searchParams.get("sortBy") as any) || "id",
      sortOrder: (searchParams.get("sortOrder") as any) || "desc",
    };

    const result = await queryBuses(params);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      stats: result.stats,
      message: "Lấy danh sách xe thành công",
    });
  } catch (error) {
    console.error("Lỗi khi tải danh sách xe:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi tải danh sách xe" },
      { status: 500 }
    );
  }
}

// POST /api/buses - Tạo mới xe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = busSchema.safeParse(body);
    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const errorMessage = issues.map((i) => i.message).join(", ");
      return NextResponse.json(
        {
          success: false,
          message: errorMessage || "Dữ liệu thông tin xe không hợp lệ",
          errors: issues,
        },
        { status: 400 }
      );
    }

    const validData = validationResult.data;

    // Kiểm tra trùng biển số xe
    const plateExists = await checkBusPlateConflict(validData.plate);
    if (plateExists) {
      return NextResponse.json(
        { success: false, message: `Biển số xe "${validData.plate.toUpperCase()}" đã tồn tại trong hệ thống.` },
        { status: 409 }
      );
    }

    const newBus = await createBus(validData);

    return NextResponse.json(
      {
        success: true,
        data: newBus,
        message: `Đã thêm xe mới biển số "${newBus.plate}" (${newBus.id}) thành công!`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Lỗi khi thêm xe mới:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi thêm xe mới." },
      { status: 500 }
    );
  }
}
