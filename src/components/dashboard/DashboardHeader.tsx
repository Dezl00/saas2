"use client";

import { useState } from "react";
import { Search, ChevronDown, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { exitImpersonation } from "@/app/(admin)/admin/stores/actions/exit-impersonation";

interface DashboardHeaderProps {
  userName: string;
  isAdminImpersonating?: boolean;
}

export function DashboardHeader({ userName, isAdminImpersonating = false }: DashboardHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 md:right-64 z-20 bg-white/80 backdrop-blur-md border-b border-surface-100 h-16 flex items-center justify-between px-4 md:px-8">
        {/* Global Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative group w-full md:w-96">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="ابحث في لوحة التحكم..."
              className="block w-full pl-3 pr-10 py-2 border-2 border-surface-200 rounded-[24px] leading-5 bg-surface-50 text-surface-900 placeholder-surface-400 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-0 transition-all font-medium sm:text-sm"
            />
          </div>
        </div>

        {/* User Profile / Dropdown */}
        <div className="mr-4 flex items-center gap-2 relative">
          {isAdminImpersonating && (
            <form action={exitImpersonation} className="hidden sm:block">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-error-100 text-error-700 rounded-[24px] font-bold hover:bg-error-200 transition-colors text-sm"
                title="أنت الآن تدير هذا المتجر كأدمن"
              >
                <LogOut className="w-4 h-4" />
                العودة للأدمن
              </button>
            </form>
          )}

          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 cursor-pointer p-1 md:pr-4 md:pl-2 rounded-[24px] hover:bg-surface-100 transition-colors"
          >
            <div className="text-end hidden sm:block">
              <p className="text-sm font-bold text-surface-950">{userName}</p>
              <p className="text-[11px] font-medium text-surface-500">مدير المتجر</p>
            </div>
            <div className="w-10 h-10 rounded-[24px] bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
              {userName.charAt(0)}
            </div>
            <ChevronDown className={cn("w-4 h-4 text-surface-400 transition-transform hidden sm:block", isDropdownOpen && "rotate-180")} />
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-surface-200 rounded-[24px] py-2 z-50 animate-fade-in origin-top-left ">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-error-600 hover:bg-error-50 font-bold transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Logout Confirmation Modal - No Blur, Solid Overlay */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-surface-950/40" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative bg-white rounded-[24px] p-6 md:p-8 max-w-md w-full shadow-none border-2 border-surface-100 animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-error-100 text-error-600 flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-surface-950 text-center mb-2">تسجيل الخروج</h3>
            <p className="text-surface-500 text-center mb-8 font-medium">هل أنت متأكد من رغبتك في تسجيل الخروج من حسابك؟</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3.5 bg-surface-100 hover:bg-surface-200 text-surface-700 rounded-[24px] font-bold transition-all"
              >
                إلغاء
              </button>
              <form action="/api/auth/signout" className="flex-1">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-error-600 hover:bg-error-700 text-white rounded-[24px] font-bold transition-all"
                >
                  تأكيد الخروج
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
