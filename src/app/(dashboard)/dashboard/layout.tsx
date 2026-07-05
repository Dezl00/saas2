import { Header } from "@/components/dashboard/Header";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

export default async function DashboardSubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const cookieStore = await cookies();
  const isAdminImpersonating = session?.user?.role === "ADMIN" && cookieStore.has("admin_managed_store_id");

  return (
    <>
      <div className="p-4 md:p-8 flex-1 animate-fade-in">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </div>
    </>
  );
}
