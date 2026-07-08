"use client";
import { useState } from "react";
import { OnboardingClient } from "@/app/onboarding/client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OnboardingPreviewPage() {
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else setStep(1); // loop back to step 1 when clicking "Go to Dashboard"
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-surface-500 font-medium">
          <Link href="/admin/settings" className="hover:text-primary-600 transition-colors">إعدادات المنصة</Link>
          <span>/</span>
          <span className="text-surface-900 font-semibold">معاينة شاشات التهيئة</span>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-surface-200 pb-6">
        <Link
          href="/admin/settings"
          className="p-2 bg-white border border-surface-200 rounded-[24px] hover:bg-surface-50 transition-colors"
        >
          <ArrowRight className="w-5 h-5 rtl:-scale-x-100 text-surface-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-950">معاينة مراحل التهيئة</h1>
          <p className="text-surface-800/60 mt-1">هذه معاينة حية لشاشات التهيئة كما تظهر للمستخدمين الجدد</p>
        </div>
      </div>

      <div className="bg-surface-50 flex flex-col items-center justify-center p-4 py-4 rounded-[2rem] border border-surface-200" dir="rtl">
        <div className="w-full max-w-lg bg-white rounded-[2rem] overflow-hidden border border-surface-200">
          <div className="p-4 md:p-6">
            <OnboardingClient 
              step={step} 
              storeName="متجر الذواقة" 
              subdomain="aldhawaqa" 
              isPreview={true}
              onPreviewNext={handleNext}
              onPreviewPrev={handlePrev}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
