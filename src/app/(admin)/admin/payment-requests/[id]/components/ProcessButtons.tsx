"use client";

import { useTransition } from "react";
import { processPaymentRequestAction } from "../../actions/process-payment-request-action";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function ProcessButtons({ requestId, storeId, planId }: { requestId: string, storeId: string, planId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleProcess = (status: "APPROVED" | "REJECTED") => {
    startTransition(async () => {
      const res = await processPaymentRequestAction(requestId, storeId, planId, status);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(status === "APPROVED" ? "تم قبول الدفع وتفعيل الباقة" : "تم رفض الدفع");
        router.refresh();
      }
    });
  };

  return (
    <div className="flex gap-4">
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleProcess("APPROVED")}
        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-success-600 rounded-[24px] hover:bg-success-700 transition-colors disabled:opacity-70"
      >
        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
        قبول وتفعيل
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleProcess("REJECTED")}
        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-danger-600 rounded-[24px] hover:bg-danger-700 transition-colors disabled:opacity-70"
      >
        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
        رفض الطلب
      </button>
    </div>
  );
}
