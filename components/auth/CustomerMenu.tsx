import Link from "next/link";
import { getCurrentCustomer } from "@/lib/session";
import LogoutButton from "./LogoutButton";

export default async function CustomerMenu() {
  const customer = await getCurrentCustomer();
  if (customer) return <><span className="font-medium">Xin chào, {customer.name}</span><LogoutButton /></>;
  return <>
    <Link href="/login" className="font-medium text-gray-600 hover:text-[#ef5222]">Đăng nhập</Link>
    <Link href="/register" className="bg-[#ef5222] hover:bg-[#d94a1d] text-white font-medium py-2 px-5 rounded-md">Đăng ký</Link>
  </>;
}
