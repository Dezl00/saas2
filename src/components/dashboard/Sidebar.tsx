"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Settings,
  LogOut,
  Store,
  Menu as MenuIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    document.addEventListener('toggle-sidebar', handleToggle);
    return () => document.removeEventListener('toggle-sidebar', handleToggle);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "الرئيسية", exact: true },
    { href: "/dashboard/orders", icon: ShoppingBag, label: "العمليات" },
    { href: "/dashboard/menu", icon: UtensilsCrossed, label: "المنيو" },
    { href: "/dashboard/settings", icon: Settings, label: "الإعدادات" },
  ];

  return (
    <>
      {/* Sidebar (Desktop) */}
      <aside className={cn(
        "fixed inset-y-0 right-0 z-40 w-72 bg-white border-l border-surface-200 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-8 pb-4">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center transition-transform">
              <Store className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-surface-950 tracking-tight">لوحة التحكم</h2>
              <p className="text-sm font-medium text-surface-500">إدارة المتجر</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <div className="text-xs font-bold text-surface-400 mb-4 px-2 uppercase tracking-wider">
            القائمة الرئيسية
          </div>
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 transition-colors rounded-2xl",
                  isActive
                    ? "bg-primary-600 text-white font-bold"
                    : "text-surface-600 hover:bg-surface-100 hover:text-surface-950 font-medium"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5",
                    isActive ? "text-white" : "text-surface-500"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6">
          <Link
            href="/api/auth/signout"
            className="flex items-center justify-center gap-3 w-full px-4 py-3.5 text-error-600 font-bold hover:bg-error-50 rounded-2xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-surface-950/20 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

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
                "flex flex-col items-center gap-1.5 p-2 transition-colors relative w-full",
                isActive ? "text-primary-600" : "text-surface-400 hover:text-surface-600"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-colors",
                isActive && "bg-primary-50"
              )}>
                <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                "text-[10px]",
                isActive ? "font-bold" : "font-medium"
              )}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
