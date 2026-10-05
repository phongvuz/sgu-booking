import { getCurrentAdmin } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import {
  queryEmployees,
  createEmployee,
  checkEmployeeEmailConflict,
  checkEmployeePhoneConflict,
} from "@/lib/employee-store";
import { employeeSchema } from "@/lib/validations/employee";
import { EmployeeQueryParams } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/employees - Lấy danh sách nhân viên có phân trang, tìm kiếm và lọc
export async function GET(request: NextRequest) {
  try {
    if (!(await getCurrentAdmin())) {
      return NextResponse.json({ message: "Bạn không có quyền quản trị!" }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);

    const params: EmployeeQueryParams = {
      search: searchParams.get("search") || "",
      role: searchParams.get("role") || "",
      department: searchParams.get("department") || "",
      status: searchParams.get("status") || "",
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 10,
      sortBy: (searchParams.get("sortBy") as any) || "id",
      sortOrder: (searchParams.get("sortOrder") as any) || "desc",
    };

    const result = await queryEmployees(params);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: "Lấy danh sách nhân viên thành công",
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách nhân viên:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi tải danh sách nhân viên" },
      { status: 500 }
    );
  }
}

// POST /api/employees - Tạo mới một nhân viên
export async function POST(request: NextRequest) {
  try {
    if (!(await getCurrentAdmin())) {
      return NextResponse.json({ message: "Bạn không có quyền quản trị!" }, { status: 403 });
    }
    const body = await request.json();

    // Validate payload with Zod
    const validationResult = employeeSchema.safeParse(body);
    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const errorMessage = issues.map((i) => i.message).join(", ");
      return NextResponse.json(
        {
          success: false,
          message: errorMessage || "Dữ liệu không hợp lệ",
          errors: issues,
        },
        { status: 400 }
      );
    }

    const validData = validationResult.data;

    // Check duplicate email / phone qua tầng Service
    const emailExists = await checkEmployeeEmailConflict(validData.email);
    if (emailExists) {
      return NextResponse.json(
        { success: false, message: `Email "${validData.email}" đã tồn tại trên hệ thống.` },
        { status: 409 }
      );
    }

    const phoneExists = await checkEmployeePhoneConflict(validData.phone);
    if (phoneExists) {
      return NextResponse.json(
        { success: false, message: `Số điện thoại "${validData.phone}" đã được sử dụng.` },
        { status: 409 }
      );
    }

    const newEmployee = await createEmployee({
      name: validData.name,
      email: validData.email,
      phone: validData.phone,
      role: validData.role,
      department: validData.department,
      status: validData.status,
      identityCard: validData.identityCard,
      address: validData.address,
      startDate: validData.startDate,
    });

    return NextResponse.json(
      {
        success: true,
        data: newEmployee,
        message: `Đã thêm nhân viên "${newEmployee.name}" (${newEmployee.id}) thành công!`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Lỗi khi thêm nhân viên:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi thêm nhân viên." },
      { status: 500 }
    );
  }
}
