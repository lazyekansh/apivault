import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signUserToken, COOKIE_NAME } from "@/lib/jwt";
import { getClientIp } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { passKey } = body;

    if (!passKey || typeof passKey !== "string") {
      return NextResponse.json({ error: "Pass key is required" }, { status: 400 });
    }

    const pass = await prisma.pass.findUnique({
      where: { key: passKey.trim() },
    });

    if (!pass) {
      return NextResponse.json({ error: "Invalid pass key" }, { status: 401 });
    }

    if (!pass.isActive) {
      return NextResponse.json({ error: "This pass has been revoked" }, { status: 403 });
    }

    const clientIp = getClientIp(request);

    if (pass.ipAddress === null) {
      await prisma.pass.update({
        where: { id: pass.id },
        data: { ipAddress: clientIp },
      });
    } else {
      if (pass.ipAddress !== clientIp) {
        return NextResponse.json(
          { error: "Access denied: IP address mismatch" },
          { status: 403 }
        );
      }
    }

    const token = await signUserToken(pass.id);

    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[AUTH_LOGIN]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
