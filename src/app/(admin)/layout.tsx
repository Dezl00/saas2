import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import {
  LogOut,
  LayoutDashboard
} from "lucide-react";
import { GlobalSearch } from "@/components/admin/GlobalSearch";
import { AdminHeaderNotifications } from "@/components/admin/AdminHeaderNotifications";
import { PageTransitionLoader } from "@/components/ui/PageTransitionLoader";
import { connection } from "next/server";

import { prisma } from "@/lib/prisma";

import { AdminNav, AdminMobileNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const platformSetting = await prisma.platformSetting.findFirst() || {
    dashboardTheme: "blue",
    dashboardFont: "cairo",
    dashboardCustomColor: null,
  };

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
      style={customColorStyles}
    >
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex md:flex-col fixed inset-y-0 right-0 w-64 bg-white border-l border-surface-200 z-30">
        <div className="p-6 border-b border-surface-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[24px] bg-primary-100 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="font-bold text-surface-950">لوحة الأدمن</h2>
              <p className="text-xs text-surface-800/50">إدارة المنصة</p>
            </div>
          </div>
        </div>

        <AdminNav />

        <div className="p-4 border-t border-surface-100 flex-shrink-0">
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-[24px] text-error-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">تسجيل الخروج</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:mr-64 flex flex-col min-h-screen relative w-full max-w-full">
        {/* Simple Header with Search */}
        <header className="fixed top-0 left-0 right-0 md:right-64 z-20 bg-white/80 border-b border-surface-100 h-16 flex items-center justify-between px-4 md:px-8">
          <div className="flex-1 max-w-xl">
            <GlobalSearch />
          </div>
          <div className="mr-4 flex items-center gap-2">
            <AdminHeaderNotifications />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 pt-16 pb-20 md:pb-8 w-full max-w-full overflow-x-hidden">
          <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">{children}</div>
        </main>
      </div>

      <AdminMobileNav />
    </div>
  );
}
