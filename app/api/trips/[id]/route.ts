import { getCurrentAdmin } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { getTripByIdOrCode, updateTrip, deleteTrip } from "@/services/tripService";

type ParamsContext = {
  params: Promise<{ id: string }>;
};

// GET /api/trips/[id] - Lấy thông tin chi tiết một tuyến xe
export async function GET(request: NextRequest, { params }: ParamsContext) {
  try {
    const { id } = await params;
    const trip = await getTripByIdOrCode(id);

    if (!trip) {
      return NextResponse.json(
        { success: false, message: `Không tìm thấy tuyến xe có mã ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: trip,
    });
  } catch (error) {
    console.error("Lỗi khi truy vấn tuyến xe:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi tìm tuyến xe." },
      { status: 500 }
    );
  }
}

// PUT /api/trips/[id] - Cập nhật thông tin tuyến xe
export async function PUT(request: NextRequest, { params }: ParamsContext) {
  try {
    if (!(await getCurrentAdmin())) {
      return NextResponse.json({ message: "Bạn không có quyền quản trị!" }, { status: 403 });
    }
    const { id } = await params;
    const body = await request.json();

    const updatedTrip = await updateTrip(id, {
      from: body.from !== undefined ? String(body.from).trim() : undefined,
      to: body.to !== undefined ? String(body.to).trim() : undefined,
      time: body.time ? new Date(body.time) : undefined,
      price: body.price !== undefined ? Number(body.price) : undefined,
      availableSeats:
        body.availableSeats !== undefined
          ? Number(body.availableSeats)
          : body.emptySeats !== undefined
          ? Number(body.emptySeats)
          : undefined,
    });

    if (!updatedTrip) {
      return NextResponse.json(
        { success: false, message: `Không tìm thấy tuyến xe có mã ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Cập nhật tuyến xe ${id} thành công!`,
      data: updatedTrip,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật tuyến xe:", error);
    return NextResponse.json(
      { success: false, message: "Dữ liệu cập nhật không hợp lệ." },
      { status: 400 }
    );
  }
}

// DELETE /api/trips/[id] - Xóa một tuyến xe
export async function DELETE(request: NextRequest, { params }: ParamsContext) {
  try {
    if (!(await getCurrentAdmin())) {
      return NextResponse.json({ message: "Bạn không có quyền quản trị!" }, { status: 403 });
    }
    const { id } = await params;
    const deletedTrip = await deleteTrip(id);

    if (!deletedTrip) {
      return NextResponse.json(
        { success: false, message: `Không tìm thấy tuyến xe có mã ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Đã xóa tuyến xe ${id} khỏi cơ sở dữ liệu.`,
      data: deletedTrip,
    });
  } catch (error) {
    console.error("Lỗi khi xóa tuyến xe:", error);
    return NextResponse.json(
      { success: false, message: "Không thể xóa tuyến xe khỏi cơ sở dữ liệu." },
      { status: 500 }
    );
  }
}
