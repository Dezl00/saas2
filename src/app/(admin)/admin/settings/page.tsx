import { prisma } from "@/lib/prisma";
import { Settings, Save, Lock, LayoutTemplate, ArrowLeft } from "lucide-react";
import { updatePlatformSettings, updateAdminPassword } from "./actions";
import { SubmitButton } from "@/components/dashboard/SubmitButton";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import Link from "next/link";

export const metadata = {
  title: "إعدادات المنصة | لوحة الأدمن",
};

export default async function AdminSettingsPage() {
  let settings = null;
  
  try {
    settings = await prisma.platformSetting.findUnique({
      where: { id: "1" },
    });
  } catch (e) {
    // Fallback if DB migration hasn't successfully applied
    console.warn("PlatformSetting table missing or DB unreachable", e);
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-surface-500 font-medium">
          <Link href="/admin" className="hover:text-primary-600 transition-colors">الرئيسية</Link>
          <span>/</span>
          <span className="text-surface-900 font-semibold">إعدادات المنصة</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* إعدادات المنصة الأساسية */}
        <div className="bg-white rounded-[24px] border border-surface-200 p-6">
          <h3 className="text-xl font-semibold text-surface-950 mb-6 flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary-500" />
            الهوية البصرية للمنصة
          </h3>

          <form action={updatePlatformSettings as any} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-surface-950 mb-1">
                اسم المنصة *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={settings?.name || "منصتك"}
                required
                className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-[24px] text-surface-950 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
              />
            </div>

            <div>
              <label htmlFor="supportWhatsapp" className="block text-sm font-medium text-surface-950 mb-1">
                رقم واتساب للدعم (يظهر للمستخدمين الموقوفين)
              </label>
              <input
                type="text"
                id="supportWhatsapp"
                name="supportWhatsapp"
                dir="ltr"
                defaultValue={settings?.supportWhatsapp || ""}
                placeholder="01012345678"
                className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-[24px] text-surface-950 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
              />
            </div>

            <div>
              <ImageUpload name="logo" label="الشعار (Logo)" defaultValue={settings?.logo} />
            </div>

            <div className="pt-4 border-t border-surface-100">
              <h4 className="text-sm font-semibold text-surface-950 mb-3">خيارات التحقق (OTP)</h4>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-surface-50 border border-surface-200 rounded-[24px] cursor-pointer hover:bg-surface-100 transition-colors">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      name="enableEmailOtp" 
                      value="true"
                      defaultChecked={settings?.enableEmailOtp} 
                      className="w-5 h-5 text-primary-600 bg-white border-surface-300 rounded focus:ring-primary-500 focus:ring-2"
                    />
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-surface-950">تفعيل التحقق بالبريد الإلكتروني</span>
                    <span className="block text-xs text-surface-500">إرسال كود من 4 أرقام عبر الإيميل</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-surface-50 border border-surface-200 rounded-[24px] cursor-pointer hover:bg-surface-100 transition-colors">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      name="enablePhoneOtp" 
                      value="true"
                      defaultChecked={settings?.enablePhoneOtp ?? true} 
                      className="w-5 h-5 text-primary-600 bg-white border-surface-300 rounded focus:ring-primary-500 focus:ring-2"
                    />
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-surface-950">تفعيل التحقق برقم الهاتف (SMS)</span>
                    <span className="block text-xs text-surface-500">إرسال كود من 6 أرقام عبر Firebase</span>
                  </div>
                </label>
                
                <p className="text-xs text-surface-500 bg-surface-50 p-2 rounded-lg mt-2">
                  * إذا قمت بإيقاف الخيارين معاً، سيتمكن المستخدم من تسجيل الدخول مباشرة بدون الحاجة لأي رمز تحقق.
                </p>
              </div>
            </div>

            <SubmitButton
              className="mt-6 w-full py-3 px-8 bg-primary-600 hover:bg-primary-700 text-white rounded-[24px] font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              حفظ بيانات المنصة
            </SubmitButton>
          </form>
        </div>

        {/* تغيير كلمة مرور الأدمن */}
        <div className="bg-white rounded-[24px] border border-surface-200 p-6 self-start">
          <h3 className="text-xl font-semibold text-surface-950 mb-6 flex items-center gap-2">
            <Lock className="w-6 h-6 text-surface-700" />
            تغيير كلمة المرور الخاصة بك
          </h3>

          <form action={updateAdminPassword as any} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-surface-950 mb-1">
                كلمة المرور الجديدة *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                minLength={6}
                dir="ltr"
                className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-[24px] text-surface-950 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
              />
            </div>

            <SubmitButton
              className="mt-6 w-full py-3 px-8 bg-surface-950 hover:bg-surface-800 text-white rounded-[24px] font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              تحديث كلمة المرور
            </SubmitButton>
          </form>
        </div>

        {/* أدوات إضافية */}
        <div className="bg-white rounded-[24px] border border-surface-200 p-6 self-start lg:col-span-2">
          <h3 className="text-xl font-semibold text-surface-950 mb-6 flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-primary-500" />
            أدوات إضافية
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/admin/settings/onboarding-preview"
              className="group flex items-center justify-between p-4 rounded-[24px] border border-surface-200 bg-surface-50 hover:bg-white hover:border-primary-200 hover: transition-all"
            >
              <div>
                <h4 className="font-bold text-surface-950 mb-1 group-hover:text-primary-600 transition-colors">معاينة مراحل التهيئة (Onboarding)</h4>
                <p className="text-sm text-surface-500">معاينة وتجربة الشاشات التي تظهر للمستخدمين الجدد عند التسجيل</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white border border-surface-200 flex items-center justify-center flex-shrink-0 group-hover:border-primary-200 group-hover:bg-primary-50 transition-colors">
                <ArrowLeft className="w-5 h-5 text-surface-400 group-hover:text-primary-600 rtl:-scale-x-100 transition-colors" />
              </div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
