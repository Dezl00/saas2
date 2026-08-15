"use client";

import { useState, useTransition } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { createMenuItem } from "@/app/(dashboard)/dashboard/catalog/actions/create-menu-item";
import { updateMenuItem } from "@/app/(dashboard)/dashboard/catalog/actions/update-menu-item";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import toast from "react-hot-toast";

type Category = { id: string; name: string };
export type MenuItemData = {
  id: string;
  name: string;
  description: string | null;
  price: string | number;
  image: string | null;
  categoryId: string;
  sizes: { id?: string; name: string; price: string | number }[];
  addons: { id?: string; name: string; price: string | number }[];
};

export function MenuItemForm({ categories, initialData, onSuccess, storeId }: { categories: Category[], initialData?: MenuItemData, onSuccess?: () => void, storeId?: string }) {
  const [sizes, setSizes] = useState<{ name: string; price: string }[]>(
    initialData?.sizes ? initialData.sizes.map(s => ({ name: s.name, price: s.price.toString() })) : []
  );
  const [addons, setAddons] = useState<{ name: string; price: string }[]>(
    initialData?.addons ? initialData.addons.map(a => ({ name: a.name, price: a.price.toString() })) : []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addSize = () => setSizes([...sizes, { name: "", price: "" }]);
  const removeSize = (index: number) => setSizes(sizes.filter((_, i) => i !== index));
  const updateSize = (index: number, field: "name" | "price", value: string) => {
    const newSizes = [...sizes];
    newSizes[index][field] = value;
    setSizes(newSizes);
  };

  const addAddon = () => setAddons([...addons, { name: "", price: "" }]);
  const removeAddon = (index: number) => setAddons(addons.filter((_, i) => i !== index));
  const updateAddon = (index: number, field: "name" | "price", value: string) => {
    const newAddons = [...addons];
    newAddons[index][field] = value;
    setAddons(newAddons);
  };

  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append("sizes", JSON.stringify(sizes));
    formData.append("addons", JSON.stringify(addons));

    startTransition(async () => {
      try {
        let result;
        if (initialData) {
          result = await updateMenuItem(initialData.id, formData);
        } else {
          result = await createMenuItem(formData);
        }

        if (result?.error) {
          toast.error(result.error);
          setIsSubmitting(false);
          return;
        }
        
        toast.success(initialData ? "تم تحديث الصنف بنجاح" : "تمت إضافة الصنف بنجاح");
        
        // Reset form after successful submission
        if (!initialData) {
          const formElement = document.getElementById("menuItemForm") as HTMLFormElement;
          if (formElement) formElement.reset();
          setSizes([]);
          setAddons([]);
        }
        if (onSuccess) onSuccess();
      } catch (error) {
        toast.error("حدث خطأ أثناء الحفظ");
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  return (
    <form id="menuItemForm" onSubmit={handleSubmit} className="space-y-6">
      {storeId && <input type="hidden" name="storeId" value={storeId} />}
      <div className="space-y-5">
        <div>
          <label htmlFor="categoryId" className="block text-sm font-bold text-surface-950 mb-2">القسم *</label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={initialData?.categoryId || ""}
            className="w-full px-4 py-3 bg-surface-50 border-2 border-surface-200 rounded-[24px] text-surface-950 font-bold focus:border-primary-500 outline-none transition-colors cursor-pointer"
          >
            <option value="">اختر القسم...</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-bold text-surface-950 mb-2">اسم الصنف *</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={initialData?.name}
            placeholder="مثال: برجر لحم مشوي"
            className="w-full px-4 py-3 bg-surface-50 border-2 border-surface-200 rounded-[24px] text-surface-950 font-bold focus:border-primary-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-bold text-surface-950 mb-2">
            السعر الأساسي * <span className="text-xs font-normal text-surface-500">(سيتم استخدامه إذا لم يقم باختيار حجم)</span>
          </label>
          <input
            type="number"
            id="price"
            name="price"
            step="0.01"
            required
            defaultValue={initialData?.price}
            placeholder="0.00"
            className="w-full px-4 py-3 bg-surface-50 border-2 border-surface-200 rounded-[24px] text-surface-950 font-bold focus:border-primary-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-bold text-surface-950 mb-2">الوصف (اختياري)</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={initialData?.description || ""}
            className="w-full px-4 py-3 bg-surface-50 border-2 border-surface-200 rounded-[24px] text-surface-950 font-medium focus:border-primary-500 outline-none transition-colors resize-none"
          />
        </div>

        <div>
          <ImageUpload name="image" label="صورة الصنف (اختياري)" defaultValue={initialData?.image} />
        </div>
      </div>

      {/* الأحجام */}
      <div className="border-2 border-surface-100 rounded-[24px] p-5 bg-surface-50 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-surface-950">الأحجام (اختياري)</h4>
          <button type="button" onClick={addSize} className="text-xs font-bold bg-primary-100 text-primary-700 px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-primary-200 transition-colors">
            <Plus className="w-4 h-4" /> إضافة حجم
          </button>
        </div>
        {sizes.map((size, index) => (
          <div key={index} className="flex flex-wrap sm:flex-nowrap gap-3 items-center bg-white p-2 rounded-[24px] border-2 border-surface-100">
            <input
              type="text"
              placeholder="اسم الحجم (مثال: كبير)"
              value={size.name}
              onChange={(e) => updateSize(index, "name", e.target.value)}
              className="flex-1 px-3 py-2 bg-surface-50 border-2 border-surface-100 rounded-lg focus:border-primary-500 outline-none font-bold text-sm min-w-[120px]"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="السعر"
              value={size.price}
              onChange={(e) => updateSize(index, "price", e.target.value)}
              className="w-24 sm:w-32 px-3 py-2 bg-surface-50 border-2 border-surface-100 rounded-lg focus:border-primary-500 outline-none font-bold text-sm"
              required
            />
            <button type="button" onClick={() => removeSize(index)} className="w-10 h-10 flex items-center justify-center text-error-500 hover:bg-error-50 rounded-lg shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* الإضافات */}
      <div className="border-2 border-surface-100 rounded-[24px] p-5 bg-surface-50 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-surface-950">الإضافات (اختياري)</h4>
          <button type="button" onClick={addAddon} className="text-xs font-bold bg-primary-100 text-primary-700 px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-primary-200 transition-colors">
            <Plus className="w-4 h-4" /> إضافة
          </button>
        </div>
        {addons.map((addon, index) => (
          <div key={index} className="flex flex-wrap sm:flex-nowrap gap-3 items-center bg-white p-2 rounded-[24px] border-2 border-surface-100">
            <input
              type="text"
              placeholder="اسم الإضافة (مثال: جبنة زيادة)"
              value={addon.name}
              onChange={(e) => updateAddon(index, "name", e.target.value)}
              className="flex-1 px-3 py-2 bg-surface-50 border-2 border-surface-100 rounded-lg focus:border-primary-500 outline-none font-bold text-sm min-w-[120px]"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="السعر"
              value={addon.price}
              onChange={(e) => updateAddon(index, "price", e.target.value)}
              className="w-24 sm:w-32 px-3 py-2 bg-surface-50 border-2 border-surface-100 rounded-lg focus:border-primary-500 outline-none font-bold text-sm"
              required
            />
            <button type="button" onClick={() => removeAddon(index)} className="w-10 h-10 flex items-center justify-center text-error-500 hover:bg-error-50 rounded-lg shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-[24px] transition-all active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
          {initialData ? "تحديث الصنف" : "حفظ الصنف"}
        </button>

        {initialData && (
          <button
            type="button"
            onClick={() => {
              if (onSuccess) onSuccess();
              else window.location.href = window.location.pathname;
            }}
            className="w-full py-3.5 bg-surface-100 hover:bg-surface-200 text-surface-700 font-bold rounded-[24px] transition-all active:scale-[0.98]"
          >
            إلغاء التعديل
          </button>
        )}
      </div>
    </form>
  );
}
