"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Package, Grid, Image as ImageIcon, Tag } from "lucide-react";

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { name: "المنتجات", href: "/dashboard/menu", icon: Package },
    { name: "الأقسام", href: "/dashboard/menu/categories", icon: Grid },
    { name: "البنرات الإعلانية", href: "/dashboard/menu/banners", icon: ImageIcon },
    { name: "كوبونات الخصم", href: "/dashboard/menu/coupons", icon: Tag },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-extrabold text-surface-950 tracking-tight">إدارة المنيو</h1>
        <p className="text-surface-500 mt-2 font-medium">أضف المنتجات، الأقسام، العروض والخصومات.</p>
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
