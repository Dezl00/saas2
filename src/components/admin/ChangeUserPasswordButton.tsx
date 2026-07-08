"use client";

import { useState } from "react";
import { KeyRound, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { changeUserPassword } from "@/app/(admin)/admin/users/actions/change-user-password";

export function ChangeUserPasswordButton({ userId, userName }: { userId: string, userName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await changeUserPassword(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("تم تغيير كلمة المرور بنجاح");
        setIsOpen(false);
      }
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-surface-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
        title="تغيير كلمة المرور"
      >
        <KeyRound className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" dir="rtl">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl animate-fade-in overflow-hidden">
            <div className="p-4 border-b border-surface-200 flex items-center justify-between">
              <h3 className="font-bold text-surface-950">تغيير كلمة المرور</h3>
              <button onClick={() => setIsOpen(false)} className="text-surface-500 hover:text-surface-950">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input type="hidden" name="userId" value={userId} />
              
              <div>
                <label className="block text-sm font-medium text-surface-950 mb-1">
                  كلمة المرور الجديدة لـ ({userName})
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  dir="ltr"
                  className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-surface-950 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
