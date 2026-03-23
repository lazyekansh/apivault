import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { isActive, label, resetIp } = body;

    const updateData: Record<string, unknown> = {};
    if (typeof isActive === "boolean") updateData.isActive = isActive;
    if (typeof label === "string") updateData.label = label.trim() || null;
    if (resetIp === true) updateData.ipAddress = null;

    const pass = await prisma.pass.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ pass }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_PASS_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.pass.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_PASS_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
