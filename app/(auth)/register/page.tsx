import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Đăng ký tài khoản | Nhà xe Sài Gòn",
  description: "Tạo tài khoản để đặt vé và quản lý lịch trình dễ dàng",
};

export default function RegisterPage() {
  return (
    <>
      <div className="text-center">
        <span className="text-4xl">🚌</span>
        <h2 className="mt-2 text-2xl font-black text-gray-800 tracking-tight">
          ĐĂNG KÝ THÀNH VIÊN
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Nhận ưu đãi và quản lý chuyến đi nhanh chóng
        </p>
      </div>

      <RegisterForm />
    </>
  );
}
