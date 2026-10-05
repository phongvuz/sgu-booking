import Link from "next/link";
import { getCurrentCustomer } from "@/lib/session";
import CustomerDropdown from "./CustomerDropdown";

export default async function CustomerMenu() {
  const customer = await getCurrentCustomer();
  if (customer) return <><span className="font-medium">Xin chào, {customer.name}</span><CustomerDropdown /></>;
  return <>
    <Link href="/login" className="font-medium text-gray-600 hover:text-[#1a9e09]">Đăng nhập</Link>
    <Link href="/register" className="bg-[#1a9e09] hover:bg-[#1db63e] text-white font-medium py-2 px-5 rounded-md">Đăng ký</Link>
  </>;
}
