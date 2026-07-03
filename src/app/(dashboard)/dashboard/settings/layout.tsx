"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Store, Palette, MapPin, Bell, CreditCard, Import } from "lucide-react";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { name: "عام", href: "/dashboard/settings", icon: Store },
    { name: "المظهر", href: "/dashboard/settings/appearance", icon: Palette },
    { name: "الفروع", href: "/dashboard/settings/branches", icon: MapPin },
    { name: "مناطق التوصيل", href: "/dashboard/settings/delivery-areas", icon: MapPin },
    { name: "الإشعارات", href: "/dashboard/settings/push-notifications", icon: Bell },
    { name: "الاشتراك والفوترة", href: "/dashboard/settings/billing", icon: CreditCard },
    { name: "بيانات المتجر", href: "/dashboard/settings/import-export", icon: Import },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-extrabold text-surface-950 tracking-tight">إعدادات المتجر</h1>
        <p className="text-surface-500 mt-2 font-medium">قم بتخصيص متجرك وإدارة تفضيلاتك.</p>
      </div>

      <div className="bg-surface-100/50 p-1.5 rounded-2xl flex overflow-x-auto hide-scrollbar border border-surface-200/50">
        <div className="flex w-max min-w-full gap-1">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                  isActive
                    ? "bg-white text-primary-700 shadow-sm ring-1 ring-surface-200/50"
                    : "text-surface-600 hover:text-surface-950 hover:bg-surface-200/50"
                )}
              >
                <tab.icon className={cn("w-4 h-4", isActive ? "text-primary-600" : "text-surface-400")} />
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="animate-fade-in">
        {children}
      </div>
    </div>
  );
}
