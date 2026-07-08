"use client";

import { useActionState } from "react";
import { createPaymentMethodAction } from "../actions";
import { Loader2, Save, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useEffect } from "react";
import Link from "next/link";

export default function NewPaymentMethodPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createPaymentMethodAction, null);

  useEffect(() => {
    if (state?.success) {
      toast.success("تم إضافة طريقة الدفع بنجاح");
      router.push("/admin/payment-methods");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/payment-methods"
          className="p-2 text-surface-500 hover:text-surface-900 bg-white rounded-lg border border-surface-200 hover:bg-surface-50 transition-colors"
        >
          <ChevronRight className="w-5 h-5 rtl:rotate-180" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">إضافة طريقة دفع</h1>
          <p className="text-sm text-surface-500 mt-1">
            أضف طرق دفع مثل (InstaPay, فودافون كاش، تحويل بنكي) ليستخدمها المتاجر.
          </p>
        </div>
      </div>

      <form action={formAction} className="bg-white rounded-[24px] border border-surface-200 overflow-hidden ">
        <div className="p-6 sm:p-8 space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-surface-900 mb-1">اسم طريقة الدفع *</label>
            <input type="text" name="name" required className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="مثال: فودافون كاش" />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-900 mb-1">معلومات الحساب / الرقم *</label>
            <input type="text" name="accountInfo" required className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="رقم الموبايل أو رقم الحساب البنكي" />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-900 mb-1">تعليمات الدفع (اختياري)</label>
            <textarea name="instructions" rows={3} className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="اكتب أي تعليمات إضافية يقرأها التاجر قبل الدفع..."></textarea>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-surface-900 mb-1">الترتيب</label>
              <input type="number" name="sortOrder" defaultValue="0" className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-3">
              <input type="checkbox" name="isActive" value="true" defaultChecked className="w-5 h-5 text-primary-600 rounded border-surface-300 focus:ring-primary-600" />
              <span className="font-bold text-surface-900">طريقة الدفع مفعلة ومتاحة</span>
            </label>
          </div>

        </div>

        <div className="bg-surface-50 p-6 border-t border-surface-200 flex justify-end gap-3">
          <Link 
            href="/admin/payment-methods"
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
            إضافة الطريقة
          </button>
        </div>
      </form>
    </div>
  );
}
