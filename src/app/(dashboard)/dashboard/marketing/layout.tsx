"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ImageIcon, Tag, Bell } from "lucide-react";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { name: "البنرات الإعلانية", href: "/dashboard/marketing/banners", icon: ImageIcon },
    { name: "كوبونات الخصم", href: "/dashboard/marketing/coupons", icon: Tag },
    { name: "الإشعارات المنبثقة", href: "/dashboard/marketing/push-notifications", icon: Bell },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-4">
        <h1 className="text-3xl font-extrabold text-surface-950 tracking-tight">أدوات التسويق</h1>
        <p className="text-surface-500 mt-2 font-medium">عزز مبيعاتك وتفاعل مع عملائك بسهولة.</p>
      </div>

      <div className="sticky top-16 z-10 bg-white/95 pt-4 pb-4 mb-8 -mx-4 px-4 md:mx-0 md:px-0">
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
