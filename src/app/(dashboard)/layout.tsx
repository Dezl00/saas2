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

  let platformSetting: any = { dashboardTheme: "blue", dashboardFont: "cairo", dashboardCustomColor: null };
  try {
    const { prisma } = await import("@/lib/prisma");
    const settings = await prisma.platformSetting.findFirst();
    if (settings) {
      platformSetting = settings;
    }
  } catch (error) {
    console.error("Error fetching platform settings:", error);
  }

  const customColorStyles = platformSetting.dashboardTheme === "custom" && platformSetting.dashboardCustomColor ? {
    "--color-primary-50": `color-mix(in srgb, ${platformSetting.dashboardCustomColor} 10%, white)`,
    "--color-primary-100": `color-mix(in srgb, ${platformSetting.dashboardCustomColor} 20%, white)`,
    "--color-primary-200": `color-mix(in srgb, ${platformSetting.dashboardCustomColor} 40%, white)`,
    "--color-primary-300": `color-mix(in srgb, ${platformSetting.dashboardCustomColor} 60%, white)`,
    "--color-primary-400": `color-mix(in srgb, ${platformSetting.dashboardCustomColor} 80%, white)`,
    "--color-primary-500": platformSetting.dashboardCustomColor,
    "--color-primary-600": `color-mix(in srgb, ${platformSetting.dashboardCustomColor} 80%, black)`,
    "--color-primary-700": `color-mix(in srgb, ${platformSetting.dashboardCustomColor} 60%, black)`,
    "--color-primary-800": `color-mix(in srgb, ${platformSetting.dashboardCustomColor} 40%, black)`,
    "--color-primary-900": `color-mix(in srgb, ${platformSetting.dashboardCustomColor} 20%, black)`,
    "--color-primary-950": `color-mix(in srgb, ${platformSetting.dashboardCustomColor} 10%, black)`,
  } as React.CSSProperties : {};

  return (
    <div 
      className={`min-h-screen bg-white flex flex-col md:flex-row w-full overflow-x-hidden theme-${platformSetting.dashboardTheme} font-${platformSetting.dashboardFont} dashboard-layout`}
      dir="rtl"
      style={customColorStyles}
    >
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 md:mr-64 flex flex-col min-h-screen relative w-full max-w-full">
        {/* Simple Header */}
        <header className="fixed top-0 left-0 right-0 md:right-64 z-20 bg-white/80 backdrop-blur-md border-b border-surface-100 h-16 flex items-center justify-between px-4 md:px-8">
          <div className="flex-1"></div>
          <div className="mr-4 flex items-center gap-2">
            {/* Future Store Notifications/Profile can go here */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 pt-16 pb-20 md:pb-8 w-full max-w-full overflow-x-hidden">
          <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      <Toaster position="top-center" />
    </div>
  );
}
