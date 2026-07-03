"use client";

import { useActionState, useState } from "react";
import { submitPaymentRequestAction } from "../actions";
import { Loader2, UploadCloud, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useEffect, useRef } from "react";

export function CheckoutForm({ planId, methods, storeId }: { planId: string, methods: any[], storeId: string }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(submitPaymentRequestAction, null);
  const [selectedMethod, setSelectedMethod] = useState<string>(methods[0]?.id || "");
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success("تم رفع طلب الدفع بنجاح. سنقوم بمراجعته قريباً.");
      router.push("/dashboard/billing");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  const activeMethodObj = methods.find(m => m.id === selectedMethod);

  return (
    <form action={formAction} className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-sm">
      <input type="hidden" name="planId" value={planId} />
      <input type="hidden" name="storeId" value={storeId} />

      <div className="p-6 sm:p-8 space-y-8">
        
        {/* 1. Select Method */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-surface-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-100 text-surface-600 text-sm">1</span>
            اختر طريقة الدفع
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {methods.map(m => (
              <label 
                key={m.id}
                className={`relative flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${
                  selectedMethod === m.id 
                    ? "border-primary-600 bg-primary-50 ring-1 ring-primary-600" 
                    : "border-surface-200 hover:border-surface-300 hover:bg-surface-50"
                }`}
              >
                <input 
                  type="radio" 
                  name="methodId" 
                  value={m.id}
                  checked={selectedMethod === m.id}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="sr-only" 
                />
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-surface-900">{m.name}</span>
                  {selectedMethod === m.id && <CheckCircle2 className="w-5 h-5 text-primary-600" />}
                </div>
                <span className="text-sm font-mono text-surface-600">{m.accountInfo}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 2. Instructions */}
        {activeMethodObj?.instructions && (
          <div className="bg-surface-50 rounded-xl p-4 border border-surface-200 text-sm text-surface-700">
            <strong>تعليمات البائع:</strong> {activeMethodObj.instructions}
          </div>
        )}

        {/* 3. Transaction Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-surface-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-100 text-surface-600 text-sm">2</span>
            معلومات التحويل
          </h3>
          <div>
            <label className="block text-sm font-medium text-surface-900 mb-1">الرقم المرجعي (Transaction ID) - اختياري</label>
            <input 
              type="text" 
              name="transactionId" 
              className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" 
              placeholder="مثال: 123456789" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-900 mb-1">صورة الإيصال *</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-surface-300 border-dashed rounded-xl hover:border-primary-500 hover:bg-primary-50/50 transition-colors cursor-pointer"
            >
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-surface-400" />
                <div className="flex text-sm text-surface-600 justify-center">
                  <span className="relative rounded-md font-bold text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                    اضغط لرفع صورة
                  </span>
                  <input 
                    id="receiptImage" 
                    name="receiptImage" 
                    type="file" 
                    accept="image/*" 
                    className="sr-only" 
                    required 
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setFileName(e.target.files[0].name);
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-surface-500">PNG, JPG حتى 5MB</p>
                {fileName && <p className="text-sm font-bold text-success-600 mt-2">{fileName}</p>}
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="bg-surface-50 p-6 border-t border-surface-200">
        <button
          type="submit"
          disabled={isPending || !selectedMethod}
          className="w-full inline-flex justify-center items-center gap-2 px-8 py-3 text-base font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-70 shadow-sm"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          تأكيد ورفع الطلب
        </button>
      </div>
    </form>
  );
}
