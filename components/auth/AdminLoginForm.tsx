"use client";

import { useRouter } from "next/navigation";
import LoginForm from "./LoginForm";

export default function AdminLoginForm() {
  const router = useRouter();
  return <LoginForm variant="admin" onSuccess={() => {
    router.replace("/admin");
    router.refresh();
  }} />;
}
