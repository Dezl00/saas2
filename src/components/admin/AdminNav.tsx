"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogOut, Home } from "lucide-react";

type NavItem = {
  href: string;
  icon: any;
  label: string;
};

export function AdminNav({ navItems }: { navItems: NavItem[] }) {
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

export function AdminMobileNav({ navItems }: { navItems: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200 flex items-center justify-around p-2 pb-safe z-50">
      {navItems.map((item) => {
        const isActive = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-colors",
              isActive ? "text-primary-600" : "text-surface-500 hover:text-primary-600 active:text-primary-600"
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
      <Link
        href="/api/auth/signout"
        className="flex flex-col items-center gap-1 p-2 text-error-500 hover:text-error-600 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-[10px] font-medium">خروج</span>
      </Link>
    </nav>
  );
}
