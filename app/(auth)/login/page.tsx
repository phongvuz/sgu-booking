import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Đăng nhập | Nhà xe Sài Gòn",
  description: "Đăng nhập hệ thống đặt vé xe Nhà xe Sài Gòn",
};

export default function LoginPage() {
  return (
    <>
      <div className="text-center">
        <span className="text-4xl">🚌</span>
        <h2 className="mt-2 text-2xl font-black text-gray-800 tracking-tight">
          ĐĂNG NHẬP
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Hệ thống đặt vé xe trực tuyến Nhà xe Sài Gòn
        </p>
      </div>

      <LoginForm />
    </>
  );
}