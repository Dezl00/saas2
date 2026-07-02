"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FolderTree,
  UtensilsCrossed,
  ShoppingBag,
  Ticket,
  Settings,
  LogOut,
  Store,
  MapPin,
  Map,
  MoreHorizontal,
  CreditCard,
  FileUp,
  Palette,
  ImageIcon,
  Tags,
  Percent,
  Bell
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
    { href: "/dashboard", icon: LayoutDashboard, label: "الرئيسية" },
    { href: "/dashboard/categories", icon: FolderTree, label: "الأقسام" },
    { href: "/dashboard/menu", icon: UtensilsCrossed, label: "المنيو" },
    { href: "/dashboard/banners", icon: Ticket, label: "العروض والبانرات" },
    { href: "/dashboard/coupons", icon: Percent, label: "كوبونات الخصم" },
    { href: "/dashboard/push-notifications", icon: Bell, label: "الإشعارات" },
    { href: "/dashboard/appearance", icon: Palette, label: "المظهر" },
    { href: "/dashboard/branches", icon: MapPin, label: "الفروع" },
    { href: "/dashboard/delivery-areas", icon: Map, label: "مناطق التوصيل" },
    { href: "/dashboard/orders", icon: ShoppingBag, label: "الطلبات" },
    { href: "/dashboard/coupons", icon: Ticket, label: "الكوبونات" },
    { href: "/dashboard/import-export", icon: FileUp, label: "استيراد وتصدير" },
    { href: "/dashboard/billing", icon: CreditCard, label: "الاشتراك والفوترة" },
    { href: "/dashboard/settings", icon: Settings, label: "الإعدادات" },
  ];

  return (
    <>
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-e border-surface-200 z-10">
      <div className="p-6 border-b border-surface-100">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary-100 flex items-center justify-center transition-transform">
            <Store className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="font-bold text-surface-950">لوحة التحكم</h2>
            <p className="text-xs text-surface-800/50">إدارة المتجر</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const shouldPrefetch = ["/dashboard", "/dashboard/orders", "/dashboard/menu"].includes(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={shouldPrefetch ? true : null}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition-colors",
                isActive
                  ? "bg-primary-50 text-primary-700 border-r-4 border-primary-600"
                  : "text-surface-600 hover:bg-surface-50 hover:text-surface-950 border-r-4 border-transparent"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive
                    ? "text-primary-600"
                    : "group-hover:text-primary-500"
                )}
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-surface-100">
        <form
          action={async () => {
            // Using a server action via a form for logout is handled in the layout or client
            // Since this is a client component, we should handle this via next-auth/react
          }}
        >
            <Link
                href="/api/auth/signout"
                className="flex items-center gap-3 w-full px-4 py-3 text-error-600 hover:bg-error-50 transition-colors border-r-4 border-transparent"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">تسجيل الخروج</span>
            </Link>
        </form>
      </div>
    </aside>

    {/* Bottom Navigation (Mobile) */}
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200 flex items-center justify-around p-2 pb-safe z-50">
      {navItems.filter(item => ["/dashboard", "/dashboard/menu", "/dashboard/categories", "/dashboard/orders"].includes(item.href)).sort((a, b) => {
        const order = ["/dashboard", "/dashboard/categories", "/dashboard/menu", "/dashboard/orders"];
        return order.indexOf(a.href) - order.indexOf(b.href);
      }).map((item) => {
        const isActive = pathname === item.href;
        const shouldPrefetch = ["/dashboard", "/dashboard/orders", "/dashboard/menu"].includes(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={shouldPrefetch ? true : null}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-colors",
              isActive ? "text-primary-600" : "text-surface-500 hover:text-primary-600"
            )}
          >
            <item.icon className="w-6 h-6 flex-shrink-0" />
            <span className="text-[10px] font-bold whitespace-nowrap">{item.label}</span>
          </Link>
        );
      })}
      
      <Link
        href="/dashboard/more"
        className={cn(
          "flex flex-col items-center gap-1 p-2 transition-colors",
          pathname === "/dashboard/more" ? "text-primary-600" : "text-surface-500 hover:text-primary-600"
        )}
      >
        <MoreHorizontal className="w-6 h-6 flex-shrink-0" />
        <span className="text-[10px] font-bold whitespace-nowrap">المزيد</span>
      </Link>
    </nav>
    </>
  );
}
