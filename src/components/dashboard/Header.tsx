"use client";

import { Menu, LogOut, ChevronDown } from "lucide-react";
import { exitImpersonation } from "@/app/(admin)/admin/stores/actions";

interface HeaderProps {
  title?: string;
  userName?: string;
  isAdminImpersonating?: boolean;
}

export function Header({ title = "لوحة التحكم", userName = "المستخدم", isAdminImpersonating = false }: HeaderProps) {
  return (
    <header className="bg-surface-50 md:bg-white sticky top-0 z-30 transition-colors">
      <div className="flex items-center justify-between px-6 py-4 md:py-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => document.dispatchEvent(new CustomEvent('toggle-sidebar'))}
            className="md:hidden p-2 -mr-2 text-surface-950 rounded-xl hover:bg-surface-200/50 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-2xl md:text-3xl font-extrabold text-surface-950 tracking-tight">{title}</h1>
        </div>

        <div className="flex items-center gap-4">
          {isAdminImpersonating && (
            <form action={exitImpersonation}>
              <button
                type="submit"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-error-100 text-error-700 rounded-xl font-bold hover:bg-error-200 transition-colors text-sm"
                title="أنت الآن تدير هذا المتجر كأدمن"
              >
                <LogOut className="w-4 h-4" />
                العودة للأدمن
              </button>
            </form>
          )}
          <div className="flex items-center gap-3 cursor-pointer p-1.5 md:pr-4 md:pl-2 rounded-2xl hover:bg-surface-100 transition-colors">
            <div className="text-end hidden sm:block">
              <p className="text-sm font-bold text-surface-950">{userName}</p>
              <p className="text-[11px] font-medium text-surface-500">مدير المتجر</p>
            </div>
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
              {userName.charAt(0)}
            </div>
            <ChevronDown className="w-4 h-4 text-surface-400 hidden sm:block" />
          </div>
        </div>
      </div>
    </header>
  );
}
