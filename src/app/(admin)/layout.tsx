import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Store,
  LogOut,
  Settings,
  Home,
  Search,
  PackageSearch,
  Crown,
  CreditCard,
  Receipt,
  Palette,
} from "lucide-react";
import { GlobalSearch } from "@/components/admin/GlobalSearch";
import { AdminHeaderNotifications } from "@/components/admin/AdminHeaderNotifications";
import { PageTransitionLoader } from "@/components/ui/PageTransitionLoader";
import { connection } from "next/server";

import { prisma } from "@/lib/prisma";

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
  };

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "الرئيسية" },
    { href: "/admin/users", icon: Users, label: "المستخدمين" },
    { href: "/admin/stores", icon: Store, label: "المتاجر" },
    { href: "/admin/plans", icon: Crown, label: "الباقات" },
    { href: "/admin/payment-methods", icon: CreditCard, label: "طرق الدفع" },
    { href: "/admin/payment-requests", icon: Receipt, label: "طلبات الدفع" },
    { href: "/admin/default-products", icon: PackageSearch, label: "المنتجات الافتراضية" },
    { href: "/admin/appearance", icon: Palette, label: "المظهر العام" },
    { href: "/admin/settings", icon: Settings, label: "إعدادات المنصة" },
  ];

  return (
    <div className={`min-h-screen bg-surface-50 flex flex-col md:flex-row w-full overflow-x-hidden theme-${platformSetting.dashboardTheme} font-${platformSetting.dashboardFont} dashboard-layout`}>
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex md:flex-col fixed inset-y-0 right-0 w-64 bg-white border-l border-surface-200 z-30">
        <div className="p-6 border-b border-surface-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="font-bold text-surface-950">لوحة الأدمن</h2>
              <p className="text-xs text-surface-800/50">إدارة المنصة</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-surface-800/70 hover:bg-surface-50 hover:text-surface-950 transition-all group"
            >
              <item.icon className="w-5 h-5 group-hover:text-primary-500 transition-colors" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-surface-100 flex-shrink-0">
          <form
            action={async () => {
              "use server";
              const { signOut } = await import("@/lib/auth");
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-error-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">تسجيل الخروج</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:mr-64 flex flex-col min-h-screen relative w-full max-w-full">
        {/* Simple Header with Search */}
        <header className="fixed top-0 left-0 right-0 md:right-64 z-20 bg-white/80 backdrop-blur-md border-b border-surface-100 h-16 flex items-center justify-between px-4 md:px-8">
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

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200 flex items-center justify-around p-2 pb-safe z-50">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 p-2 text-surface-500 hover:text-primary-600 active:text-primary-600 transition-colors"
          >
            {item.href === "/admin" ? (
              <Home className="w-5 h-5" />
            ) : (
              <item.icon className="w-5 h-5" />
            )}
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
        <form
          action={async () => {
            "use server";
            const { signOut } = await import("@/lib/auth");
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="flex flex-col items-center gap-1 p-2 text-error-500 hover:text-error-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] font-medium">خروج</span>
          </button>
        </form>
      </nav>
    </div>
  );
}
