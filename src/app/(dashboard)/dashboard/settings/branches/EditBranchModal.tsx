"use client";

import { useState } from "react";
import { Edit2, X } from "lucide-react";
import { editBranch } from "./actions";
import { SubmitButton } from "@/components/dashboard/SubmitButton";
import toast from "react-hot-toast";

type Branch = {
  id: string;
  name: string;
  phone: string | null;
  whatsappNumber: string | null;
  address: string | null;
  mapUrl: string | null;
};

export function EditBranchModal({ branch }: { branch: Branch }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    formData.append("branchId", branch.id);
    const res = await editBranch(formData);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("تم التعديل بنجاح");
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-100 transition-colors text-surface-500"
        title="تعديل الفرع"
      >
        <Edit2 className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}>
          <div className="bg-white rounded-[32px] w-[90%] max-w-lg overflow-hidden shadow-xl animate-zoom-in">
            <div className="p-6 border-b border-surface-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-surface-950">تعديل الفرع</h3>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-100 transition-colors">
                <X className="w-5 h-5 text-surface-500" />
              </button>
            </div>
            
            <form action={handleSubmit} className="p-6 space-y-4 text-start">
              <div>
                <label className="block text-sm font-bold text-surface-950 mb-2">اسم الفرع *</label>
                <input type="text" name="name" defaultValue={branch.name} required className="w-full px-5 py-3.5 bg-white border border-surface-200 rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-surface-950 mb-2">العنوان التفصيلي</label>
                <textarea name="address" defaultValue={branch.address || ""} rows={2} className="w-full px-5 py-3.5 bg-white border border-surface-200 rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-surface-950 mb-2">هاتف الفرع</label>
                  <input type="text" name="phone" defaultValue={branch.phone || ""} dir="ltr" className="w-full px-5 py-3.5 bg-white border border-surface-200 rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-end" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-surface-950 mb-2">رقم الواتساب</label>
                  <input type="text" name="whatsappNumber" defaultValue={branch.whatsappNumber || ""} dir="ltr" className="w-full px-5 py-3.5 bg-white border border-surface-200 rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-end" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-surface-950 mb-2">رابط الخريطة</label>
                <input type="url" name="mapUrl" defaultValue={branch.mapUrl || ""} dir="ltr" className="w-full px-5 py-3.5 bg-white border border-surface-200 rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-end" />
              </div>
              
              <SubmitButton className="w-full mt-4 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-[24px] font-bold transition-colors">
                حفظ التعديلات
              </SubmitButton>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
