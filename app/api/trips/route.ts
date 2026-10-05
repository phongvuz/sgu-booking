import { getCurrentAdmin } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { resolveLocationName } from "@/types";
import { getTrips, createTrip, queryTripsAdmin } from "@/services/tripService";
import { tripSchema } from "@/lib/validations/trip";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/trips - Lấy danh sách chuyến xe (hỗ trợ cả tìm kiếm khách đặt vé lẫn trang quản trị Admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdminMode = searchParams.get("admin") === "true" || searchParams.has("page") || searchParams.has("limit");

    if (isAdminMode) {
      const result = await queryTripsAdmin({
        search: searchParams.get("search") || "",
        from: searchParams.get("from") || "",
        to: searchParams.get("to") || "",
        date: searchParams.get("date") || "",
        page: searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1,
        limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 8,
        sortBy: (searchParams.get("sortBy") as any) || "time",
        sortOrder: (searchParams.get("sortOrder") as any) || "asc",
      });

      return NextResponse.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        stats: result.stats,
        message: "Lấy danh sách chuyến xe quản trị thành công",
      });
    }

    const fromParam = searchParams.get("from")?.trim() || "";
    const toParam = searchParams.get("to")?.trim() || "";
    const dateParam = searchParams.get("date")?.trim() || "";

    const fromCity = resolveLocationName(fromParam);
    const toCity = resolveLocationName(toParam);

    const trips = await getTrips({
      fromCity,
      toCity,
      date: dateParam || undefined,
      includeBookings: true,
    });

    return NextResponse.json({
      success: true,
      count: trips.length,
      data: trips,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách chuyến xe:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi tải danh sách chuyến xe." },
      { status: 500 }
    );
  }
}

// POST /api/trips - Tạo và lưu trữ một tuyến xe mới
export async function POST(request: NextRequest) {
  try {
    if (!(await getCurrentAdmin())) {
      return NextResponse.json({ message: "Bạn không có quyền quản trị!" }, { status: 403 });
    }
    const body = await request.json();

    const validationResult = tripSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues
        .map((i) => i.message)
        .join(", ");
      return NextResponse.json(
        {
          success: false,
          message: errorMessage || "Dữ liệu chuyến xe không hợp lệ",
          errors: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const validData = validationResult.data;

    const newTrip = await createTrip({
      code: validData.code || undefined,
      from: validData.from,
      to: validData.to,
      time: validData.time,
      price: validData.price,
      availableSeats: validData.availableSeats,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Tạo chuyến xe ${newTrip.code} (${newTrip.from} → ${newTrip.to}) thành công!`,
        data: newTrip,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Lỗi khi tạo tuyến xe:", error);
    const message = error instanceof Error ? error.message : "Lỗi hệ thống khi tạo tuyến xe.";
    const isConflict = message.includes("đã tồn tại");
    return NextResponse.json(
      { success: false, message },
      { status: isConflict ? 409 : 500 }
    );
  }
}
