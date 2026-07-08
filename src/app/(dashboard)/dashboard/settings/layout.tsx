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
    { name: "الاشتراك والفوترة", href: "/dashboard/settings/billing", icon: CreditCard },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-4">
        <h1 className="text-3xl font-extrabold text-surface-950 tracking-tight">إعدادات المتجر</h1>
        <p className="text-surface-500 mt-2 font-medium">قم بتخصيص متجرك وإدارة تفضيلاتك.</p>
      </div>

      <div className="sticky top-16 z-10 bg-white/95 backdrop-blur-sm pt-4 pb-4 mb-8 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex overflow-x-auto hide-scrollbar">
          <div className="flex w-max min-w-full gap-2">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn("flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap", isActive ? "bg-primary-600 text-white" : "bg-surface-100 text-surface-600 hover:text-surface-950 hover:bg-surface-200")}
                >
                  <tab.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-surface-500")} />
                  {tab.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="animate-fade-in">
        {children}
      </div>
    </div>
  );
}
