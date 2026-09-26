import { randomBytes, scrypt } from "node:crypto";

// Store the algorithm and salt alongside the hash for future login verification.
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
  return `scrypt:${salt}:${hash.toString("hex")}`;
}
