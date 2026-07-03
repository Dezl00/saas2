import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Toaster } from "react-hot-toast";
import { PageTransitionLoader } from "@/components/ui/PageTransitionLoader";
import { connection } from "next/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const session = await auth();

  if (!session || (session.user.role !== "OWNER" && session.user.role !== "ADMIN")) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const isAdminImpersonating = session?.user?.role === "ADMIN" && cookieStore.has("admin_managed_store_id");

  if (session.user.role === "ADMIN" && !isAdminImpersonating) {
    redirect("/admin");
  }

  if (session.user.role === "OWNER" && !isAdminImpersonating) {
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user && user.onboardingStep < 4) {
      redirect("/onboarding");
    }
  }

  let platformSetting = { dashboardTheme: "blue", dashboardFont: "cairo" };
  try {
    const { prisma } = await import("@/lib/prisma");
    const settings = await prisma.platformSetting.findFirst();
    if (settings) {
      platformSetting = settings;
    }
  } catch (error) {
    console.error("Error fetching platform settings:", error);
  }

  return (
    <div className={`flex h-screen bg-surface-50 overflow-hidden theme-${platformSetting.dashboardTheme} font-${platformSetting.dashboardFont} dashboard-layout`} dir="rtl">
      <Sidebar />
      <main className="flex-1 overflow-auto flex flex-col pb-20 md:pb-0">
        {children}
      </main>
      <Toaster position="top-center" />
    </div>
  );
}
