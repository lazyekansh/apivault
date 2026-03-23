import { type NextRequest, NextResponse } from "next/server";
import { signAdminToken, COOKIE_NAME } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
    }

    if (password !== adminPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signAdminToken();

    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[ADMIN_LOGIN]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
