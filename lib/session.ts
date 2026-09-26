import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "customer_session";
export const SESSION_AGE = 60 * 60 * 24;
export const sessionCookieOptions = {
  httpOnly: true, secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const, path: "/", maxAge: SESSION_AGE,
};

function sign(value: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters");
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function createSessionToken(userId: number, now = Date.now()) {
  const payload = `${userId}.${now + SESSION_AGE * 1000}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string, now = Date.now()): number | null {
  if (!/^\d+\.\d+\.[a-f0-9]{64}$/.test(token)) return null;
  const [id, expires, signature] = token.split(".");
  if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0 || Number(expires) <= now) return null;
  if (!timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(sign(`${id}.${expires}`), "hex"))) return null;
  return Number(id);
}

// Recheck eligibility against the database whenever a session is used.
export async function getCurrentCustomer() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const id = verifySessionToken(token);
  if (!id) return null;
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, phone: true, role: true } });
  if (!user || user.role !== "CUSTOMER") return null;
  const customer = await prisma.customer.findUnique({ where: { phone: user.phone }, select: { id: true, name: true, status: true } });
  if (!customer || customer.status !== "Đang hoạt động") return null;
  return { userId: user.id, customerId: customer.id, name: customer.name };
}
