"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Image as ImageIcon, Loader2, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import { createBanner } from "../actions/create-banner";
import { updateBanner } from "../actions/update-banner";
import { deleteBanner } from "../actions/delete-banner";
import { toggleBannerStatus } from "../actions/toggle-banner-status";
import { StoreBanner } from "@prisma/client";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { cn } from "@/lib/utils";

export function BannersClient({ initialBanners }: { initialBanners: StoreBanner[] }) {
  const [banners, setBanners] = useState<StoreBanner[]>(initialBanners);
  const router = useRouter();
  
  useEffect(() => {
    setBanners(initialBanners);
  }, [initialBanners]);

  const [editingBanner, setEditingBanner] = useState<StoreBanner | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleEdit = (banner: StoreBanner) => {
    setEditingBanner(banner);
    setPreviewImage(banner.image);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingBanner(null);
    setPreviewImage(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    if (editingBanner) {
      formData.append("id", editingBanner.id);
    }

    try {
      const result = editingBanner
        ? await updateBanner(formData)
        : await createBanner(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success || "تم الحفظ بنجاح");
        // Since server action revalidates the path, initialBanners will change.
        // We will sync banners state with initialBanners via useEffect.
        router.refresh();
        cancelEdit();
        (document.getElementById("bannerForm") as HTMLFormElement)?.reset();
        setPreviewImage(null);
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteId(null);
    setIsLoading(true);

    try {
      const result = await deleteBanner(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success || "تم الحذف بنجاح");
        setBanners(prev => prev.filter(b => b.id !== id));
        if (editingBanner?.id === id) {
          cancelEdit();
        }
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    // Optimistic toggle
    setBanners(prev => prev.map(b => b.id === id ? { ...b, isActive: !currentStatus } : b));
    
    try {
      const result = await toggleBannerStatus(id, !currentStatus);
      if (result.error) {
        toast.error(result.error);
        // Revert
        setBanners(prev => prev.map(b => b.id === id ? { ...b, isActive: currentStatus } : b));
      } else {
        toast.success(result.success || "تم تحديث الحالة");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
      // Revert
      setBanners(prev => prev.map(b => b.id === id ? { ...b, isActive: currentStatus } : b));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form (Right Side) */}
      <div className="lg:col-span-1">
        <div className="bg-white border-2 border-surface-100 rounded-[32px] p-6 lg:p-8 sticky top-36">
          <h3 className="text-xl font-bold text-surface-950 mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary-600" />
            {editingBanner ? "تعديل البانر" : "إضافة بانر جديد"}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-surface-950 mb-2">
                صورة البانر <span className="text-error-500">*</span>
              </label>
              <p className="text-xs font-medium text-surface-500 mb-4">
                يفضل أن تكون الصورة بعرضية بنسبة 2.2:1 (مثال: 1100x500 بكسل)
              </p>
              <div className="relative border-2 border-dashed border-surface-300 rounded-[24px] overflow-hidden group hover:border-primary-500 transition-colors bg-surface-50">
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  required={!editingBanner && !previewImage}
                />
                {previewImage ? (
                  <div className="aspect-[2.2/1] w-full relative p-2">
                    <div className="relative w-full h-full rounded-[24px] overflow-hidden bg-surface-100">
                      <Image src={previewImage} alt="Preview" fill className="object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[24px] m-2">
                      <p className="text-white font-bold flex items-center gap-2 bg-black/50 px-4 py-2 rounded-[24px] backdrop-blur-sm">
                        <Edit2 className="w-5 h-5" />
                        تغيير الصورة
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[2.2/1] w-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 bg-white border-2 border-surface-200 rounded-[24px] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:border-primary-200">
                      <ImageIcon className="w-8 h-8 text-surface-400 group-hover:text-primary-500 transition-colors" />
                    </div>
                    <p className="font-bold text-surface-950 mb-1">انقر لاختيار صورة</p>
                    <p className="text-sm font-medium text-surface-400">JPG, PNG, WEBP</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-surface-950 mb-2">عنوان البانر (اختياري)</label>
              <input
                type="text"
                name="title"
                defaultValue={editingBanner?.title || ""}
                placeholder="مثال: خصم 20% على الوجبات العائلية"
                className="w-full px-4 py-3 font-medium bg-white border-2 border-surface-200 rounded-[24px] focus:border-primary-500 outline-none transition-all text-surface-950"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-surface-950 mb-2">رابط التوجيه (اختياري)</label>
              <input
                type="url"
                name="link"
                defaultValue={editingBanner?.link || ""}
                placeholder="https://..."
                dir="ltr"
                className="w-full px-4 py-3 font-medium bg-white border-2 border-surface-200 rounded-[24px] focus:border-primary-500 outline-none transition-all text-left text-surface-950"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-surface-950 mb-2">الترتيب</label>
              <input
                type="number"
                name="sortOrder"
                defaultValue={editingBanner?.sortOrder || 0}
                className="w-full px-4 py-3 font-medium bg-white border-2 border-surface-200 rounded-[24px] focus:border-primary-500 outline-none transition-all text-surface-950"
              />
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-[24px] transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70"
              >
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {editingBanner ? "تحديث البانر" : "إضافة البانر"}
              </button>

              {editingBanner && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="w-full py-3.5 bg-surface-100 hover:bg-surface-200 text-surface-700 font-bold rounded-[24px] transition-all active:scale-[0.98]"
                >
                  إلغاء التعديل
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* List (Left Side) */}
      <div className="lg:col-span-2">
        {banners.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center bg-white rounded-[32px] border-2 border-surface-100 border-dashed">
            <div className="w-20 h-20 bg-surface-50 border-2 border-surface-200 rounded-[24px] flex items-center justify-center mb-6">
              <ImageIcon className="w-10 h-10 text-surface-400" />
            </div>
            <p className="text-xl text-surface-950 font-bold mb-2">لا توجد عروض مضافة بعد</p>
            <p className="text-surface-500 font-medium">أضف بانرات لعرضها في واجهة المتجر</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((banner) => (
              <div key={banner.id} className="bg-white border-2 border-surface-100 rounded-[32px] overflow-hidden hover:border-surface-200 transition-colors flex flex-col">
                <div className="relative aspect-[2.2/1] w-full bg-surface-50 p-2">
                  <div className="relative w-full h-full rounded-[24px] overflow-hidden border border-surface-100/50">
                    <Image
                      src={banner.image}
                      alt={banner.title || "بانر"}
                      fill
                      className={cn("object-cover transition-all", !banner.isActive && "grayscale opacity-60")}
                    />
                  </div>
                  <div className="absolute top-4 end-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="w-9 h-9 bg-white/90 backdrop-blur text-surface-700 hover:text-primary-600 rounded-[24px] flex items-center justify-center  hover: transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(banner.id)}
                      className="w-9 h-9 bg-white/90 backdrop-blur text-surface-700 hover:text-error-600 rounded-[24px] flex items-center justify-center  hover: transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <div className="mb-4">
                    <h3 className="font-bold text-surface-950 text-lg truncate">
                      {banner.title || "بدون عنوان"}
                    </h3>
                    {banner.link && (
                      <p className="text-sm font-medium text-surface-500 truncate mt-1" dir="ltr">
                        {banner.link}
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-auto pt-4 border-t-2 border-surface-50 flex items-center justify-between">
                    <span className="text-sm font-bold text-surface-600">حالة العرض:</span>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(banner.id, banner.isActive)}
                      className={cn(
                        "relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none",
                        banner.isActive ? 'bg-success-500' : 'bg-surface-200'
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ease-in-out ",
                          banner.isActive ? '-translate-x-6' : '-translate-x-1'
                        )}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="حذف البانر"
        description="هل أنت متأكد من حذف هذا البانر؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isLoading}
      />
    </div>
  );
}
