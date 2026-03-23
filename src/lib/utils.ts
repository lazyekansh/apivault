import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { customAlphabet } from "nanoid";
import { type NextRequest } from "next/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const passAlphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const keyAlphabet = "0123456789abcdefghijklmnopqrstuvwxyz";

export function generatePass(): string {
  const nanoid = customAlphabet(passAlphabet, 32);
  return `vlt_pass_${nanoid()}`;
}

export function generateSubKey(): string {
  const nanoid = customAlphabet(keyAlphabet, 40);
  return `vlt_sk_${nanoid()}`;
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

export function maskKey(key: string): string {
  if (key.length <= 12) return "••••••••";
  return key.slice(0, 12) + "•".repeat(Math.min(key.length - 12, 16));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
