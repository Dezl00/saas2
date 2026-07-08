"use client";

import { useActionState } from "react";
import { createPlanAction } from "../../actions/create-plan-action";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useEffect } from "react";
import Link from "next/link";

export function PlanForm({ actionFn, initialData }: { actionFn: any, initialData?: any }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<any, FormData>(actionFn, null);

  useEffect(() => {
    if (state?.success) {
      toast.success("تم حفظ الباقة بنجاح");
      router.push("/admin/plans");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="bg-white rounded-[24px] border border-surface-200 overflow-hidden ">
      <div className="p-6 sm:p-8 space-y-8">
        
        {/* Basic Info */}
        <div>
          <h3 className="text-lg font-bold text-surface-900 mb-4 border-b border-surface-100 pb-2">المعلومات الأساسية</h3>
          {initialData && <input type="hidden" name="id" value={initialData.id} />}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-surface-900 mb-1">اسم الباقة *</label>
              <input type="text" name="name" defaultValue={initialData?.name} required className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="مثال: الباقة الاحترافية" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-900 mb-1">السعر (ج.م) *</label>
              <input type="number" step="0.01" name="price" defaultValue={initialData?.price} required className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="0.00" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-surface-900 mb-1">وصف الباقة</label>
              <input type="text" name="description" defaultValue={initialData?.description} className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="وصف قصير يظهر للعملاء..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-900 mb-1">المدة (بالأيام) *</label>
              <input type="number" name="durationDays" defaultValue={initialData?.durationDays ?? "30"} required className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-900 mb-1">الترتيب</label>
              <input type="number" name="sortOrder" defaultValue={initialData?.sortOrder ?? "0"} className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
            </div>
          </div>
        </div>

        {/* Feature Flags */}
        <div>
          <h3 className="text-lg font-bold text-surface-900 mb-4 border-b border-surface-100 pb-2">الحدود والمميزات (Features)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-surface-900 mb-1">الحد الأقصى للمنتجات (-1 لعدد لا نهائي)</label>
              <input type="number" name="feat_products" defaultValue={initialData?.features?.products ?? "-1"} className="w-full px-4 py-2 bg-surface-50 border border-surface-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-900 mb-1">الحد الأقصى للفروع</label>
              <input type="number" name="feat_branches" defaultValue={initialData?.features?.branches ?? "1"} className="w-full px-4 py-2 bg-surface-50 border border-surface-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-900 mb-1">الحد الأقصى للموظفين</label>
              <input type="number" name="feat_staff" defaultValue={initialData?.features?.staff ?? "1"} className="w-full px-4 py-2 bg-surface-50 border border-surface-200 rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-4 rounded-[24px] border border-surface-200 cursor-pointer hover:bg-surface-50 transition-colors">
              <input type="checkbox" name="feat_qr" value="true" defaultChecked={initialData?.features?.qr ?? false} className="w-5 h-5 text-primary-600 rounded border-surface-300 focus:ring-primary-600" />
              <div>
                <p className="font-bold text-surface-900 text-sm">QR Code الطاولات</p>
                <p className="text-xs text-surface-500">تفعيل إنشاء كود مخصص لكل طاولة</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-[24px] border border-surface-200 cursor-pointer hover:bg-surface-50 transition-colors">
              <input type="checkbox" name="feat_reports" value="true" defaultChecked={initialData?.features?.reports ?? false} className="w-5 h-5 text-primary-600 rounded border-surface-300 focus:ring-primary-600" />
              <div>
                <p className="font-bold text-surface-900 text-sm">التقارير المتقدمة</p>
                <p className="text-xs text-surface-500">الوصول لتحليلات المبيعات</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-[24px] border border-surface-200 cursor-pointer hover:bg-surface-50 transition-colors">
              <input type="checkbox" name="feat_ai" value="true" defaultChecked={initialData?.features?.ai ?? false} className="w-5 h-5 text-primary-600 rounded border-surface-300 focus:ring-primary-600" />
              <div>
                <p className="font-bold text-surface-900 text-sm">ميزات الذكاء الاصطناعي</p>
                <p className="text-xs text-surface-500">توليد الصور والوصف بالـ AI</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-[24px] border border-surface-200 cursor-pointer hover:bg-surface-50 transition-colors">
              <input type="checkbox" name="feat_customDomain" value="true" defaultChecked={initialData?.features?.customDomain ?? false} className="w-5 h-5 text-primary-600 rounded border-surface-300 focus:ring-primary-600" />
              <div>
                <p className="font-bold text-surface-900 text-sm">ربط دومين مخصص</p>
                <p className="text-xs text-surface-500">restaurant.com بدلاً من subdomain</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-[24px] border border-surface-200 cursor-pointer hover:bg-surface-50 transition-colors">
              <input type="checkbox" name="feat_removeBranding" value="true" defaultChecked={initialData?.features?.removeBranding ?? false} className="w-5 h-5 text-primary-600 rounded border-surface-300 focus:ring-primary-600" />
              <div>
                <p className="font-bold text-surface-900 text-sm">إزالة شعار المنصة</p>
                <p className="text-xs text-surface-500">إخفاء "Powered by Menura"</p>
              </div>
            </label>
          </div>
        </div>
        
        {/* Status */}
        <div>
          <label className="flex items-center gap-3">
            <input type="checkbox" name="isActive" value="true" defaultChecked={initialData ? initialData.isActive : true} className="w-5 h-5 text-primary-600 rounded border-surface-300 focus:ring-primary-600" />
            <span className="font-bold text-surface-900">الباقة مفعلة (مرئية للعملاء)</span>
          </label>
        </div>

      </div>

      <div className="bg-surface-50 p-6 border-t border-surface-200 flex justify-end gap-3">
        <Link 
          href="/admin/plans"
          className="px-6 py-2.5 text-sm font-bold text-surface-700 bg-white border border-surface-200 rounded-[24px] hover:bg-surface-50 transition-colors"
        >
          إلغاء
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-primary-600 rounded-[24px] hover:bg-primary-700 transition-colors disabled:opacity-70"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          حفظ الباقة
        </button>
      </div>
    </form>
  );
}
