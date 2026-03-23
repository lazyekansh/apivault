import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSubKey } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const passId = request.headers.get("x-vault-pass-id");
    if (!passId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subKeys = await prisma.subKey.findMany({
      where: { passId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        key: true,
        name: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ subKeys }, { status: 200 });
  } catch (error) {
    console.error("[KEYS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const passId = request.headers.get("x-vault-pass-id");
    if (!passId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { name } = body;

    const key = generateSubKey();

    const subKey = await prisma.subKey.create({
      data: {
        key,
        name: name?.trim() || null,
        passId,
      },
      select: {
        id: true,
        key: true,
        name: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ subKey }, { status: 201 });
  } catch (error) {
    console.error("[KEYS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
