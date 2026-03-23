import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/jwt";
import DashboardNav from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) redirect("/login");

  const payload = await verifyToken(token);
  if (!payload || payload.role !== "user") redirect("/login");

  return (
    <div className="min-h-screen bg-black">
      <DashboardNav />
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
