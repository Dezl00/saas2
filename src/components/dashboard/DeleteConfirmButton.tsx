"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";

interface Props {
  action: () => Promise<{ error?: string } | void | any>;
}

export function DeleteConfirmButton({ action }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async () => {
    setIsPending(true);
    try {
      const result = await action();
      if (result && typeof result === "object" && "error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success("تم الحذف بنجاح");
      }
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ أثناء الحذف");
    } finally {
      setIsPending(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(true);
        }}
        className="w-10 h-10 bg-error-50 text-error-600 hover:bg-error-100 border-2 border-error-100 flex items-center justify-center rounded-xl transition-colors shrink-0"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" dir="rtl">
          <div className="bg-white border-2 border-surface-200 rounded-[32px] p-8 w-full max-w-sm animate-fade-in text-center">
            <div className="w-20 h-20 bg-error-50 text-error-600 border-2 border-error-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-surface-950 mb-3">تأكيد الحذف</h3>
            <p className="text-surface-600 font-bold mb-8">
              هل أنت متأكد من رغبتك في الحذف؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="flex-1 py-4 bg-error-600 hover:bg-error-700 text-white font-bold rounded-2xl transition-colors disabled:opacity-50"
              >
                {isPending ? "جاري الحذف..." : "نعم، احذف"}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="flex-1 py-4 bg-surface-100 hover:bg-surface-200 text-surface-700 font-bold border-2 border-surface-200 rounded-2xl transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
