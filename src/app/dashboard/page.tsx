import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value!;
  const payload = await verifyToken(token);

  const pass = await prisma.pass.findUnique({
    where: { id: payload!.passId },
    select: {
      id: true,
      label: true,
      ipAddress: true,
      isActive: true,
      createdAt: true,
    },
  });

  const subKeys = await prisma.subKey.findMany({
    where: { passId: payload!.passId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      key: true,
      name: true,
      isActive: true,
      createdAt: true,
    },
  });

  return <DashboardClient pass={pass} initialSubKeys={subKeys} />;
}
