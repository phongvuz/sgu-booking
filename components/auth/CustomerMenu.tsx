import Link from "next/link";
import { getCurrentCustomer } from "@/lib/session";
import LogoutButton from "./LogoutButton";

export default async function CustomerMenu() {
  const customer = await getCurrentCustomer();
  if (customer) return <><span className="font-medium">Xin chào, {customer.name}</span><Link href="/profile" aria-label="Xem hồ sơ cá nhân" title="Hồ sơ cá nhân" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[#ef5222] hover:bg-orange-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ef5222]"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></svg></Link><LogoutButton /></>;
  return <>
    <Link href="/login" className="font-medium text-gray-600 hover:text-[#ef5222]">Đăng nhập</Link>
    <Link href="/register" className="bg-[#ef5222] hover:bg-[#d94a1d] text-white font-medium py-2 px-5 rounded-md">Đăng ký</Link>
  </>;
}
