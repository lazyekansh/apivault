import { type NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/jwt";

const PUBLIC_PATHS = ["/login", "/admin/login", "/api/auth/login", "/api/admin/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  if (pathname.startsWith("/api/proxy")) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = await verifyToken(token);

  if (!payload) {
    const response = pathname.startsWith("/api/")
      ? NextResponse.json({ error: "Invalid session" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  if (pathname.startsWith("/admin") && payload.role !== "admin") {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (pathname.startsWith("/dashboard") && payload.role !== "user") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-vault-role", payload.role);
  if (payload.passId) {
    requestHeaders.set("x-vault-pass-id", payload.passId);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/keys/:path*",
    "/api/user/:path*",
    "/api/proxy/:path*",
  ],
};
