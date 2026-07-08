"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Settings,
  LogOut,
  Store,
  Home,
  Megaphone
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "الرئيسية", exact: true },
    { href: "/dashboard/catalog", icon: UtensilsCrossed, label: "المنتجات" },
    { href: "/dashboard/orders", icon: ShoppingBag, label: "العمليات" },
    { href: "/dashboard/marketing/banners", icon: Megaphone, label: "التسويق" },
    { href: "/dashboard/settings", icon: Settings, label: "الإعدادات" },
  ];

  return (
    <>
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex md:flex-col fixed inset-y-0 right-0 w-64 bg-white border-l border-surface-200 z-30">
        <div className="p-6 border-b border-surface-100 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[24px] bg-primary-100 flex items-center justify-center">
              <Store className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="font-bold text-surface-950">لوحة التحكم</h2>
              <p className="text-xs text-surface-800/50">إدارة المتجر</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-[24px] transition-all group",
                  isActive
                    ? "bg-primary-600 text-white font-bold"
                    : "text-surface-800/70 hover:bg-surface-50 hover:text-surface-950 font-medium"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-white" : "group-hover:text-primary-500")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

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

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200 flex items-center justify-around p-2 pb-safe z-50">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                "flex flex-col items-center gap-1 p-2 transition-colors",
                isActive ? "text-primary-600" : "text-surface-500 hover:text-primary-600 active:text-primary-600"
              )}
            >
              {item.href === "/dashboard" ? (
                <Home className="w-5 h-5" />
              ) : (
                <item.icon className="w-5 h-5" />
              )}
              <span className={cn("text-[10px]", isActive ? "font-bold" : "font-medium")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
