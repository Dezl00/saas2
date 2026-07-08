"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { submitStep1, submitStep2, finishOnboarding } from "./actions";
import { Loader2, ArrowLeft, Check, Store, Phone, ExternalLink, CloudUpload, ArrowRight, Rocket, Sparkles, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function OnboardingClient({ 
  step, 
  storeName, 
  subdomain,
  isPreview,
  onPreviewNext,
  onPreviewPrev
}: { 
  step: number; 
  storeName: string; 
  subdomain: string;
  isPreview?: boolean;
  onPreviewNext?: () => void;
  onPreviewPrev?: () => void;
}) {
  const [isPending, setIsPending] = useState(false);
  const [isTransitionPending, startTransition] = useTransition();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const steps = [
    { id: 1, title: "هوية المتجر", icon: Store },
    { id: 2, title: "بيانات التواصل", icon: Phone },
    { id: 3, title: step === 3 ? "اكتمل" : "التفاصيل", icon: Check }
  ];

  const colors = ["#8b5cf6", "#3b82f6", "#10b981", "#f97316", "#ef4444", "#1e293b"];

  useEffect(() => {
    if (step === 3) {
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#3b82f6', '#10b981', '#f97316']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#3b82f6', '#10b981', '#f97316']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [step]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setLogoPreview(url);
    }
  };

  const storeLink = `${subdomain || 'your-store'}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'menura.site'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${storeLink}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="w-full relative">
      {copied && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slide-up flex items-center gap-2 px-6 py-3 bg-success-100/90 backdrop-blur-md text-success-700 font-medium rounded-full">
          <CheckCircle2 className="w-5 h-5 text-success-600" />
          تم نسخ الرابط بنجاح!
        </div>
      )}

      {/* Progress Indicator */}
      <div className="mb-8 relative">
        <div className="flex items-center justify-between relative z-10 px-2 sm:px-8">
          {/* Dashed background lines */}
          <div className="absolute top-6 left-[10%] right-[10%] border-t border-dashed border-surface-200 -z-10" />
          
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = s.id === step;
            const isCompleted = s.id < step;
            
            return (
              <div key={s.id} className="flex flex-col items-center bg-white px-2">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors mb-3 border-2 ${
                    isActive ? "bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-500/20" :
                    isCompleted ? "bg-success-500 border-success-500 text-white shadow-md shadow-success-500/20" :
                    "bg-white border-surface-200 text-surface-900"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${!isActive && !isCompleted ? "text-surface-950" : ""}`} />
                </div>
                <span className={`text-sm font-semibold ${isActive ? "text-primary-600" : isCompleted ? "text-success-600" : "text-surface-500"}`}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Store Identity */}
      {step === 1 && (
        <form action={isPreview ? onPreviewNext : (data) => { setIsPending(true); submitStep1(data).finally(() => setIsPending(false)); }} className="animate-fade-in">
          <div className="text-center mb-8 relative">
            <div className="inline-flex items-center justify-center gap-2 mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0f172a]">مرحباً بك! لنبدأ بتهيئة متجرك</h2>
              <Sparkles className="w-6 h-6 text-primary-500" />
            </div>
            <p className="text-surface-500 text-sm">اختر اسماً مميزاً وشعاراً يعكس هويتك التجارية</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-surface-950 mb-2">شعار المتجر <span className="text-surface-500 font-medium">(اختياري)</span></label>
              <div 
                className="border border-dashed border-primary-200 bg-primary-50/30 rounded-2xl p-6 text-center cursor-pointer hover:bg-primary-50/50 transition-colors relative"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  name="logo" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/jpeg,image/png,image/webp" 
                  className="hidden" 
                />
                
                {logoPreview ? (
                  <div className="relative w-20 h-20 mx-auto rounded-xl overflow-hidden border border-surface-200">
                    <Image src={logoPreview} alt="Preview" fill className="object-cover" unoptimized />
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CloudUpload className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-surface-950 text-sm mb-1">اسحب وأفلت الصورة هنا</p>
                    <p className="text-xs text-surface-500">أو اضغط للاختيار من معرض الصور</p>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-950 mb-2">اسم المتجر</label>
              <div className="relative">
                <Store className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={storeName} 
                  required 
                  placeholder="مثال: مطعم الذواقة"
                  className="block w-full ps-11 pe-4 py-3 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm" 
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <label className="relative cursor-pointer group shrink-0">
                  <input type="radio" name="primaryColor" value="custom" id="customColorRadio" className="peer sr-only" />
                  <div className="w-8 h-8 rounded-lg relative overflow-hidden flex items-center justify-center">
                    <input 
                      type="color" 
                      id="customColorPicker"
                      className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer opacity-0"
                      onChange={(e) => {
                        const radio = document.getElementById('customColorRadio') as HTMLInputElement;
                        if(radio) {
                          radio.value = e.target.value;
                          radio.checked = true;
                          const box = document.getElementById('customColorBox');
                          if(box) box.style.backgroundColor = e.target.value;
                        }
                      }}
                    />
                    <div id="customColorBox" className="w-full h-full rounded-lg bg-orange-500" />
                  </div>
                </label>
                <div>
                  <label className="block text-sm font-semibold text-surface-950">اللون الأساسي <span className="text-surface-500 font-medium">(اختياري)</span></label>
                  <p className="text-xs text-surface-500 mt-1">اختر لوناً يعبر عن هويتك البصرية</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                {colors.map((color) => (
                  <label key={color} className="relative cursor-pointer group">
                    <input type="radio" name="primaryColor" value={color} className="peer sr-only" defaultChecked={color === "#f97316"} />
                    <div 
                      className="w-10 h-10 rounded-full border-2 border-transparent peer-checked:border-primary-500 peer-checked:p-0.5 transition-all shadow-sm"
                    >
                      <div className="w-full h-full rounded-full" style={{ backgroundColor: color }} />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-surface-100">
            <button type="submit" disabled={isPending} className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  التالي
                  <ArrowLeft className="w-5 h-5 rtl:-scale-x-100" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Contact Info */}
      {step === 2 && (
        <form action={isPreview ? onPreviewNext : (data) => { setIsPending(true); submitStep2(data).finally(() => setIsPending(false)); }} className="animate-fade-in">
          <div className="text-center mb-8 relative">
            <div className="inline-flex items-center justify-center gap-2 mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0f172a]">بيانات التواصل</h2>
            </div>
            <p className="text-surface-500 text-sm">أضف أرقام التواصل ليتمكن عملائك من الوصول إليك بسهولة</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-surface-950 mb-2">رقم الهاتف العام</label>
              <div className="relative">
                <Phone className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input 
                  type="text" 
                  name="phone" 
                  placeholder="مثال: 01xxxxxxxxx" 
                  className="block w-full ps-11 pe-4 py-3 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm" 
                  dir="ltr" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-950 mb-2">رقم الواتساب (لاستقبال الطلبات)</label>
              <div className="relative">
                <Phone className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input 
                  type="text" 
                  name="whatsappNumber" 
                  placeholder="مثال: 01012345678" 
                  className="block w-full ps-11 pe-4 py-3 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm" 
                  dir="ltr" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-950 mb-2">العنوان الرئيسي</label>
              <div className="relative">
                <Store className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input 
                  type="text" 
                  name="address" 
                  placeholder="مثال: شارع النيل، القاهرة" 
                  className="block w-full ps-11 pe-4 py-3 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm" 
                />
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-surface-100">
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={isPreview ? onPreviewPrev : () => router.push("?step=1")} 
                className="px-6 bg-surface-50 border border-surface-200 hover:bg-surface-100 text-surface-950 py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-5 h-5 rtl:-scale-x-100" />
                السابق
              </button>
              <button type="submit" disabled={isPending} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    التالي
                    <ArrowLeft className="w-5 h-5 rtl:-scale-x-100" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <div className="text-center animate-fade-in pt-4">
          <div className="mb-6 relative">
            <div className="w-32 h-32 bg-success-50/60 rounded-full flex items-center justify-center mx-auto mb-8 relative">
              <Rocket className="w-16 h-16 text-success-600" strokeWidth={1.25} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold mb-5 flex items-center justify-center gap-2">
              <span className="text-success-600">مبروك!</span>
              <span className="text-surface-950">متجرك جاهز</span>
            </h2>
            <p className="text-surface-600 text-sm leading-relaxed max-w-md mx-auto">
              لقد تم إعداد متجرك بنجاح. يمكنك الآن مشاركة الرابط مع عملائك للبدء في استقبال الطلبات.
            </p>
          </div>

          <div className="border border-surface-200 rounded-2xl p-6 text-start">
            <p className="text-sm font-semibold text-surface-950 mb-3">رابط متجرك</p>
            <div className="flex items-center justify-between bg-primary-50 rounded-xl p-3 border border-primary-100">
              <span className="font-medium text-primary-700 text-sm sm:text-base truncate" dir="ltr">
                {storeLink}
              </span>
              <button 
                type="button"
                onClick={handleCopy}
                className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors flex-shrink-0"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            </div>
            
            <div className="mt-4 flex flex-col gap-3">
              <a 
                href={`https://${storeLink}`} 
                target="_blank" 
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-xl font-medium transition-colors flex items-center justify-center text-sm gap-2"
              >
                زيارة المتجر
                <ExternalLink className="w-4 h-4" />
              </a>
              <button 
                type="button"
                onClick={isPreview ? onPreviewNext : () => startTransition(() => { finishOnboarding(); })} 
                disabled={isTransitionPending}
                className="w-full bg-surface-50 border border-surface-200 hover:bg-surface-100 text-surface-900 py-3.5 rounded-xl font-medium transition-colors flex items-center justify-center text-sm gap-2 disabled:opacity-50"
              >
                {isTransitionPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />}
                الانتقال للوحة التحكم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
