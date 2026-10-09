import Link from "next/link";
import { getCurrentCustomer } from "@/lib/session";
import CustomerDropdown from "./CustomerDropdown";

export default async function CustomerMenu() {
  const customer = await getCurrentCustomer();
  if (customer) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-700">Xin chào, {customer.name}</span>
        <CustomerDropdown />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="text-sm font-medium text-slate-600 hover:text-brand-primary transition-colors"
      >
        Đăng nhập
      </Link>
      <Link
        href="/register"
        className="bg-brand-primary hover:bg-brand-dark text-white text-sm font-medium py-2 px-5 rounded-full transition-all shadow-sm hover:shadow"
      >
        Đăng ký
      </Link>
    </div>
  );
}
