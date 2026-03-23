import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const passId = request.headers.get("x-vault-pass-id");
    if (!passId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { isActive, name } = body;

    const existing = await prisma.subKey.findFirst({
      where: { id: params.id, passId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Sub-key not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (typeof isActive === "boolean") updateData.isActive = isActive;
    if (typeof name === "string") updateData.name = name.trim() || null;

    const subKey = await prisma.subKey.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        key: true,
        name: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ subKey }, { status: 200 });
  } catch (error) {
    console.error("[KEY_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const passId = request.headers.get("x-vault-pass-id");
    if (!passId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.subKey.findFirst({
      where: { id: params.id, passId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Sub-key not found" }, { status: 404 });
    }

    await prisma.subKey.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[KEY_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
