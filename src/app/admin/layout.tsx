import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/jwt";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) redirect("/admin/login");

  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") redirect("/admin/login");

  return (
    <div className="min-h-screen bg-black">
      <AdminNav />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
