import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AppearanceClient } from "./AppearanceClient";

export const metadata = {
  title: "المظهر العام | لوحة الأدمن",
};

export default async function AdminAppearancePage() {
  let settings = null;
  
  try {
    settings = await prisma.platformSetting.findUnique({
      where: { id: "1" },
    });
  } catch (e) {
    console.warn("PlatformSetting missing or DB error", e);
  }

  const currentTheme = settings?.dashboardTheme || "blue";
  const currentFont = settings?.dashboardFont || "cairo";
  const currentCustomColor = settings?.dashboardCustomColor || null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-surface-500 font-medium">
          <Link href="/admin" className="hover:text-primary-600 transition-colors">الرئيسية</Link>
          <span>/</span>
          <span className="text-surface-900 font-semibold">المظهر العام للوحات التحكم</span>
        </div>
      </div>

      <AppearanceClient 
        initialTheme={currentTheme} 
        initialFont={currentFont} 
        initialCustomColor={currentCustomColor}
      />
    </div>
  );
}
