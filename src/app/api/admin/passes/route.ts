import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePass } from "@/lib/utils";

export async function GET() {
  try {
    const passes = await prisma.pass.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { subKeys: true } },
      },
    });
    return NextResponse.json({ passes }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_PASSES_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { label } = body;

    const key = generatePass();

    const pass = await prisma.pass.create({
      data: {
        key,
        label: label?.trim() || null,
      },
    });

    return NextResponse.json({ pass }, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_PASSES_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
