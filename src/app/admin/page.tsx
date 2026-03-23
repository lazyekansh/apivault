import { prisma } from "@/lib/prisma";
import AdminClient from "@/components/admin/AdminClient";

export default async function AdminPage() {
  const passes = await prisma.pass.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { subKeys: true } },
    },
  });

  return <AdminClient initialPasses={passes} />;
}
