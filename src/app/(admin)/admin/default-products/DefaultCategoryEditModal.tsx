"use client";

import { useState } from "react";
import { Edit2, X } from "lucide-react";
import { editDefaultCategory } from "./actions";
import { SubmitButton } from "@/components/dashboard/SubmitButton";
import toast from "react-hot-toast";

type Category = {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
};

export function DefaultCategoryEditModal({ category }: { category: Category }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    formData.append("categoryId", category.id);
    const res = await editDefaultCategory(formData);
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
        title="تعديل القسم"
      >
        <Edit2 className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}>
          <div className="bg-white rounded-[32px] w-[90%] max-w-lg overflow-hidden shadow-xl animate-zoom-in">
            <div className="p-6 border-b border-surface-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-surface-950">تعديل القسم</h3>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-100 transition-colors">
                <X className="w-5 h-5 text-surface-500" />
              </button>
            </div>
            
            <form action={handleSubmit} className="p-6 space-y-4 text-start">
              <div>
                <label className="block text-sm font-bold text-surface-950 mb-2">اسم القسم *</label>
                <input type="text" name="name" defaultValue={category.name} required className="w-full px-5 py-3.5 bg-white border border-surface-200 rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-surface-950 mb-2">الوصف</label>
                <textarea name="description" defaultValue={category.description || ""} rows={2} className="w-full px-5 py-3.5 bg-white border border-surface-200 rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-surface-950 mb-2">الترتيب</label>
                <input type="number" name="sortOrder" defaultValue={category.sortOrder} className="w-full px-5 py-3.5 bg-white border border-surface-200 rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none" />
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
