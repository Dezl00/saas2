"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Crown, 
  CreditCard, 
  Receipt, 
  PackageSearch, 
  Palette, 
  Settings,
  LogOut, 
  Home,
  Menu,
  X
} from "lucide-react";
import { useState, useEffect } from "react";

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

export function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar Links (Desktop) */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
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
    </>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Close the more menu when navigating
  useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname]);

  const mainItems = navItems.slice(0, 4);
  const moreItems = navItems.slice(4);

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200 flex items-center justify-around p-2 pb-safe z-[60]">
        {mainItems.map((item) => {
          const isActive = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 transition-colors",
                isActive ? "text-primary-600" : "text-surface-500 hover:text-primary-600"
              )}
            >
              {item.href === "/admin" ? (
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
        
        <button
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className={cn(
            "flex flex-col items-center gap-1 p-2 transition-colors",
            isMoreOpen ? "text-primary-600" : "text-surface-500 hover:text-primary-600"
          )}
        >
          {isMoreOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          <span className={cn("text-[10px]", isMoreOpen ? "font-bold" : "font-medium")}>
            المزيد
          </span>
        </button>
      </nav>

      {/* Overlay and Drawer */}
      {isMoreOpen && (
        <div className="md:hidden fixed inset-0 z-[55] flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-black/40 transition-opacity" 
            onClick={() => setIsMoreOpen(false)}
          />
          <div className="relative bg-white rounded-t-[32px] p-6 pb-24 shadow-2xl animate-slide-up">
            <div className="w-12 h-1.5 bg-surface-200 rounded-full mx-auto mb-6" />
            <div className="grid grid-cols-3 gap-4">
              {moreItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-4 rounded-[20px] text-center transition-colors",
                      isActive ? "bg-primary-50 text-primary-600 border border-primary-100" : "bg-surface-50 text-surface-600 hover:bg-surface-100 border border-transparent"
                    )}
                  >
                    <item.icon className="w-6 h-6" />
                    <span className="text-xs font-bold leading-tight">{item.label}</span>
                  </Link>
                );
              })}
              
              <Link
                href="/api/auth/signout"
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-[20px] text-center bg-error-50 text-error-600 hover:bg-error-100 transition-colors border border-error-100"
              >
                <LogOut className="w-6 h-6" />
                <span className="text-xs font-bold leading-tight">تسجيل الخروج</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
