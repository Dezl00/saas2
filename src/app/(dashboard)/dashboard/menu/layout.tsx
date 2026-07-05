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
    <div className="max-w-6xl mx-auto pb-10">
      <div className="sticky top-16 z-10 bg-white/95 backdrop-blur-sm pt-4 pb-4 border-b border-surface-100 mb-8 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex overflow-x-auto hide-scrollbar">
          <div className="flex w-max min-w-full gap-2">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap",
                    isActive
                      ? "bg-primary-600 text-white"
                      : "text-surface-500 hover:text-surface-950 hover:bg-surface-50"
                  )}
                >
                  <tab.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-surface-400")} />
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
