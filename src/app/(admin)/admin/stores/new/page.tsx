"use client";

import { useActionState } from "react";
import { createStoreFromAdminAction } from "./actions/create-store-from-admin-action";
import Link from "next/link";
import { ArrowRight, Store, Palette, MapPin, Phone, Link as LinkIcon, Mail, Lock } from "lucide-react";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { SubmitButton } from "@/components/dashboard/SubmitButton";

export default function NewStorePage() {
  const [state, formAction] = useActionState(createStoreFromAdminAction, null);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/stores"
          className="p-2 bg-white border border-surface-200 rounded-[24px] hover:bg-surface-50 transition-colors"
        >
          <ArrowRight className="w-5 h-5 rtl:-scale-x-100 text-surface-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-950">إضافة متجر جديد</h1>
          <p className="text-surface-800/60 mt-1">قم بإعداد المتجر وصاحب المتجر بخطوات بسيطة</p>
        </div>
      </div>

      <form action={formAction} className="space-y-8">
        {state?.error && (
          <div className="p-4 bg-error-50 text-error-600 font-medium rounded-[24px] border border-error-200 animate-slide-up">
            {state.error}
          </div>
        )}

        <div className="bg-white rounded-[24px] p-8 border border-surface-200 space-y-8 ">
          {/* Logo Section */}
          <div className="max-w-md mx-auto">
            <h2 className="text-center font-bold text-surface-950 mb-4">شعار المتجر</h2>
            <ImageUpload name="logo" label="" />
            {state?.fieldErrors?.logo && <p className="text-sm text-error-500 text-center mt-2">{state.fieldErrors.logo[0]}</p>}
          </div>

          <div className="border-t border-surface-100 pt-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-surface-950 mb-2">اسم المتجر</label>
              <div className="relative">
                <Store className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={state?.data?.name as string || ""}
                  className={`w-full ps-11 pe-4 py-3 bg-surface-50 border rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors ${state?.fieldErrors?.name ? "border-error-500" : "border-surface-200"}`}
                  placeholder="مثال: مطعم البيك"
                />
              </div>
              {state?.fieldErrors?.name && <p className="text-sm text-error-500 mt-1">{state.fieldErrors.name[0]}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-surface-950 mb-2">اللون الأساسي</label>
                <div className="relative flex items-center gap-2">
                  <Palette className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                  <input
                    name="primaryColor"
                    type="text"
                    defaultValue={state?.data?.primaryColor as string || "#10b981"}
                    className="w-full ps-11 pe-4 py-3 bg-surface-50 border border-surface-200 rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                    placeholder="#10b981"
                    dir="ltr"
                  />
                  <input
                    type="color"
                    defaultValue={state?.data?.primaryColor as string || "#10b981"}
                    className="w-14 h-12 p-1 bg-surface-50 border border-surface-200 rounded-[24px] cursor-pointer shrink-0"
                    onChange={(e) => {
                      const textInput = e.target.previousElementSibling as HTMLInputElement;
                      if (textInput) textInput.value = e.target.value;
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-950 mb-2">رابط المتجر (Subdomain)</label>
                <div className="relative flex items-center">
                  <LinkIcon className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 z-10" />
                  <input
                    name="subdomain"
                    type="text"
                    required
                    defaultValue={state?.data?.subdomain as string || ""}
                    className={`w-full ps-11 pe-24 py-3 bg-surface-50 border rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors ${state?.fieldErrors?.subdomain ? "border-error-500" : "border-surface-200"}`}
                    placeholder="my-store"
                    dir="ltr"
                  />
                  <span className="absolute end-4 text-surface-500 text-sm font-medium" dir="ltr">
                    .almenu.pro
                  </span>
                </div>
                {state?.fieldErrors?.subdomain && <p className="text-sm text-error-500 mt-1">{state.fieldErrors.subdomain[0]}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-surface-950 mb-2">العنوان</label>
              <div className="relative">
                <MapPin className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  name="address"
                  type="text"
                  defaultValue={state?.data?.address as string || ""}
                  className={`w-full ps-11 pe-4 py-3 bg-surface-50 border rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors ${state?.fieldErrors?.address ? "border-error-500" : "border-surface-200"}`}
                  placeholder="عنوان المتجر كاملاً"
                />
              </div>
              {state?.fieldErrors?.address && <p className="text-sm text-error-500 mt-1">{state.fieldErrors.address[0]}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-surface-950 mb-2">رقم الهاتف</label>
                <div className="relative">
                  <Phone className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                  <input
                    name="phone"
                    type="tel"
                    required
                    defaultValue={state?.data?.phone as string || ""}
                    className={`w-full ps-11 pe-4 py-3 bg-surface-50 border rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-end transition-colors ${state?.fieldErrors?.phone ? "border-error-500" : "border-surface-200"}`}
                    placeholder="01012345678"
                    dir="ltr"
                  />
                </div>
                {state?.fieldErrors?.phone && <p className="text-sm text-error-500 mt-1">{state.fieldErrors.phone[0]}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-950 mb-2">رقم الواتساب للطلبات</label>
                <div className="relative">
                  <Phone className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-success-500" />
                  <input
                    name="whatsappNumber"
                    type="tel"
                    defaultValue={state?.data?.whatsappNumber as string || ""}
                    className={`w-full ps-11 pe-4 py-3 bg-surface-50 border rounded-[24px] focus:ring-2 focus:ring-success-500/20 focus:border-success-500 text-end transition-colors ${state?.fieldErrors?.whatsappNumber ? "border-error-500" : "border-surface-200"}`}
                    placeholder="01012345678"
                    dir="ltr"
                  />
                </div>
                {state?.fieldErrors?.whatsappNumber && <p className="text-sm text-error-500 mt-1">{state.fieldErrors.whatsappNumber[0]}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Owner Account Section */}
        <div className="bg-white rounded-[24px] p-8 border border-surface-200 space-y-6 ">
          <h2 className="text-lg font-bold text-surface-950 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary-500" />
            حساب مدير المتجر
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-surface-950 mb-2">البريد الإلكتروني الدائم</label>
              <div className="relative">
                <Mail className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={state?.data?.email as string || ""}
                  className={`w-full ps-11 pe-4 py-3 bg-surface-50 border rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors ${state?.fieldErrors?.email ? "border-error-500" : "border-surface-200"}`}
                  placeholder="admin@store.com"
                  dir="ltr"
                />
              </div>
              {state?.fieldErrors?.email && <p className="text-sm text-error-500 mt-1">{state.fieldErrors.email[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-950 mb-2">كلمة المرور المؤقتة</label>
              <div className="relative">
                <Lock className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  name="password"
                  type="password"
                  required
                  defaultValue={state?.data?.password as string || ""}
                  className={`w-full ps-11 pe-4 py-3 bg-surface-50 border rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors ${state?.fieldErrors?.password ? "border-error-500" : "border-surface-200"}`}
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>
              {state?.fieldErrors?.password && <p className="text-sm text-error-500 mt-1">{state.fieldErrors.password[0]}</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <SubmitButton 
            className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-[24px]  shadow-primary-500/20 w-full md:w-auto"
          >
            إنشاء المتجر وتفعيل الحساب
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
