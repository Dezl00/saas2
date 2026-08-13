"use client";

import { useRef } from "react";
import { Plus, Edit2, X } from "lucide-react";
import { SubmitButton } from "@/components/dashboard/SubmitButton";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { createDefaultCategory, editDefaultCategory } from "./actions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function DefaultCategoryForm({ editCategory }: { editCategory?: any }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    if (editCategory) {
      formData.append("categoryId", editCategory.id);
      const res = await editDefaultCategory(formData);
      if (res?.error) {
        toast.error(res?.error);
      } else {
        toast.success("تم التعديل بنجاح");
        router.push("/admin/default-products?tab=categories");
      }
    } else {
      const res = await createDefaultCategory(formData);
      if ((res as any)?.error) {
        toast.error((res as any).error);
      } else {
        toast.success("تم إضافة القسم بنجاح");
        formRef.current?.reset();
        router.refresh();
      }
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-surface-200 p-6 sticky top-6 max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-hide">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-surface-950 flex items-center gap-2">
          {editCategory ? <Edit2 className="w-5 h-5 text-primary-500" /> : <Plus className="w-5 h-5 text-primary-500" />}
          {editCategory ? "تعديل القسم" : "إضافة قسم افتراضي"}
        </h3>
        {editCategory && (
          <button onClick={() => router.push("/admin/default-products?tab=categories")} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-100 transition-colors">
            <X className="w-5 h-5 text-surface-500" />
          </button>
        )}
      </div>
      
      <form ref={formRef} action={handleSubmit} className="space-y-4 text-start">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-surface-950 mb-1">اسم القسم *</label>
          <input type="text" id="name" name="name" required defaultValue={editCategory?.name || ""} placeholder="مثال: مقبلات" className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-950 mb-1">صورة القسم</label>
          {editCategory?.image && (
            <div className="relative w-full h-32 mb-3 rounded-[24px] overflow-hidden border border-surface-200">
              <Image src={editCategory.image} alt={editCategory.name} fill className="object-cover" />
            </div>
          )}
          <div className="bg-surface-50 border border-surface-200 rounded-[24px] overflow-hidden p-4">
            <ImageUpload name="imageFile" label={editCategory?.image ? "تغيير الصورة" : "اختر صورة للقسم"} />
          </div>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-surface-950 mb-1">الوصف (اختياري)</label>
          <textarea id="description" name="description" rows={2} defaultValue={editCategory?.description || ""} className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none" />
        </div>
        <div>
          <label htmlFor="sortOrder" className="block text-sm font-medium text-surface-950 mb-1">الترتيب</label>
          <input type="number" id="sortOrder" name="sortOrder" defaultValue={editCategory?.sortOrder || "0"} className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none" />
        </div>
        <SubmitButton className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-[24px] font-bold transition-all">
          {editCategory ? "حفظ التعديلات" : "حفظ القسم"}
        </SubmitButton>
      </form>
    </div>
  );
}
