import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const passId = request.headers.get("x-vault-pass-id");

    if (!passId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pass = await prisma.pass.findUnique({
      where: { id: passId },
      select: {
        id: true,
        label: true,
        ipAddress: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!pass) {
      return NextResponse.json({ error: "Pass not found" }, { status: 404 });
    }

    return NextResponse.json({ pass }, { status: 200 });
  } catch (error) {
    console.error("[USER_ME]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
