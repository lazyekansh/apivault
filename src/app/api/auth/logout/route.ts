import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/jwt";

export async function POST() {
  const response = NextResponse.json({ success: true }, { status: 200 });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
