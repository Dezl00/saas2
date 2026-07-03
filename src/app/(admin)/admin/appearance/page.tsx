import { prisma } from "@/lib/prisma";
import { Palette, Type, CheckCircle2 } from "lucide-react";
import { updateAppearanceSettings } from "./actions";
import { SubmitButton } from "@/components/dashboard/SubmitButton";
import Link from "next/link";

export const metadata = {
  title: "المظهر العام | لوحة الأدمن",
};

export default async function AdminAppearancePage({
  searchParams,
}: {
  searchParams: { success?: string };
}) {
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

  const themes = [
    { id: "blue", name: "أزرق (الافتراضي)", color: "bg-blue-600" },
    { id: "emerald", name: "زمردي", color: "bg-emerald-600" },
    { id: "violet", name: "بنفسجي", color: "bg-violet-600" },
    { id: "rose", name: "وردي", color: "bg-rose-600" },
    { id: "amber", name: "عنبري", color: "bg-amber-500" },
  ];

  const fonts = [
    { id: "cairo", name: "Cairo (الافتراضي)" },
    { id: "tajawal", name: "Tajawal" },
    { id: "inter", name: "Inter" },
    { id: "ibm", name: "IBM Plex Sans Arabic" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-surface-500 font-medium">
          <Link href="/admin" className="hover:text-primary-600 transition-colors">الرئيسية</Link>
          <span>/</span>
          <span className="text-surface-900 font-semibold">المظهر العام للوحات التحكم</span>
        </div>
      </div>

      {searchParams.success === "true" && (
        <div className="bg-success-50 text-success-700 p-4 rounded-xl flex items-center gap-3 border border-success-200">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-bold text-sm">تم حفظ إعدادات المظهر وتطبيقها بنجاح على جميع لوحات التحكم!</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-surface-200 p-6 md:p-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-surface-950 mb-2">إعدادات المظهر الشاملة</h2>
          <p className="text-surface-500 text-sm font-medium">
            تطبق هذه التغييرات فوراً على لوحة تحكم الأدمن وجميع لوحات تحكم مديري المتاجر. تم إلغاء الخطوط السميكة جداً لراحة العين.
          </p>
        </div>

        <form action={updateAppearanceSettings} className="space-y-10 max-w-3xl">
          
          {/* Theme Color Selection */}
          <div>
            <h3 className="text-lg font-bold text-surface-950 mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary-500" />
              اللون الأساسي
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {themes.map((theme) => (
                <label
                  key={theme.id}
                  className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                    currentTheme === theme.id
                      ? "border-primary-500 bg-primary-50/50"
                      : "border-surface-200 bg-surface-50 hover:bg-surface-100 hover:border-surface-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="dashboardTheme"
                    value={theme.id}
                    defaultChecked={currentTheme === theme.id}
                    className="sr-only"
                  />
                  <div className={`w-8 h-8 rounded-full mb-3 shadow-sm ${theme.color}`} />
                  <span className="text-sm font-bold text-surface-950 text-center">{theme.name}</span>
                  {currentTheme === theme.id && (
                    <div className="absolute top-2 right-2 text-primary-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          <hr className="border-surface-100" />

          {/* Font Selection */}
          <div>
            <h3 className="text-lg font-bold text-surface-950 mb-4 flex items-center gap-2">
              <Type className="w-5 h-5 text-primary-500" />
              نوع الخط
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fonts.map((font) => (
                <label
                  key={font.id}
                  className={`relative flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                    currentFont === font.id
                      ? "border-primary-500 bg-primary-50/50"
                      : "border-surface-200 bg-surface-50 hover:bg-surface-100 hover:border-surface-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="dashboardFont"
                    value={font.id}
                    defaultChecked={currentFont === font.id}
                    className="sr-only"
                  />
                  <span className={`text-base font-semibold text-surface-950 font-${font.id}`}>
                    {font.name}
                  </span>
                  {currentFont === font.id && (
                    <div className="absolute top-1/2 -translate-y-1/2 left-4 text-primary-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <SubmitButton className="w-full md:w-auto min-w-[200px]">
              حفظ وتطبيق المظهر
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
