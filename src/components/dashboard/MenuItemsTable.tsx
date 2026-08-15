"use client";

import { useState, useEffect } from "react";
import { ImageIcon, Trash2, CheckSquare, Square, Loader2, PackageOpen, Star, Edit3 } from "lucide-react";
import { toggleMenuItemStatus } from "@/app/(dashboard)/dashboard/catalog/actions/toggle-menu-item-status";
import { toggleFeaturedMenuItem } from "@/app/(dashboard)/dashboard/catalog/actions/toggle-featured-menu-item";
import { deleteMenuItem } from "@/app/(dashboard)/dashboard/catalog/actions/delete-menu-item";
import { bulkDeleteMenuItems } from "@/app/(dashboard)/dashboard/catalog/actions/bulk-delete-menu-items";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import Image from "next/image";
import { BulkEditModal } from "./BulkEditModal";
import { DeleteConfirmButton } from "@/components/dashboard/DeleteConfirmButton";
import toast from "react-hot-toast";

type MenuItemType = {
  id: string;
  name: string;
  description: string | null;
  price: string | number | any;
  image: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
  categoryId: string;
  category: { id: string; name: string };
  sizes: any[];
  addons: any[];
};

type CategoryType = {
  id: string;
  name: string;
};

export function MenuItemsTable({ 
  menuItems: initialMenuItems, 
  categories,
  storeId,
  onEdit
}: { 
  menuItems: MenuItemType[], 
  categories: CategoryType[],
  storeId?: string,
  onEdit?: (item: MenuItemType) => void
}) {
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);

  useEffect(() => {
    setMenuItems(initialMenuItems);
  }, [initialMenuItems]);

  const handleToggleSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === menuItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(menuItems.map(item => item.id));
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, isAvailable: !currentStatus } : item));
    const result = await toggleMenuItemStatus(id, currentStatus, storeId);
    if (result.error) {
      toast.error(result.error);
      setMenuItems(prev => prev.map(item => item.id === id ? { ...item, isAvailable: currentStatus } : item));
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, isFeatured: !currentStatus } : item));
    const result = await toggleFeaturedMenuItem(id, currentStatus, storeId);
    if (result.error) {
      toast.error(result.error);
      setMenuItems(prev => prev.map(item => item.id === id ? { ...item, isFeatured: currentStatus } : item));
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteMenuItem(id, storeId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("تم حذف الصنف بنجاح");
      setMenuItems(prev => prev.filter(item => item.id !== id));
      setSelectedItems(prev => prev.filter(i => i !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    setIsBulkDeleting(true);
    const result = await bulkDeleteMenuItems(selectedItems, storeId);
    setIsBulkDeleting(false);
    setShowBulkDeleteConfirm(false);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`تم حذف ${selectedItems.length} صنف بنجاح`);
      setMenuItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
    }
  };

  if (menuItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border-2 border-surface-100 rounded-[32px] text-center">
        <PackageOpen className="w-16 h-16 text-surface-300 mb-4" />
        <h3 className="text-xl font-bold text-surface-900 mb-2">لا توجد أصناف حالياً</h3>
        <p className="text-surface-500 max-w-md">
          قم بإضافة أصناف جديدة للمنيو الخاص بك من خلال النموذج الجانبي.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-[24px] border-2 border-surface-100">
        <div className="flex items-center gap-4">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-surface-700 bg-surface-50 hover:bg-surface-100 rounded-[16px] transition-colors"
          >
            {selectedItems.length === menuItems.length ? (
              <CheckSquare className="w-4 h-4 text-primary-600" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            تحديد الكل
          </button>
          
          <span className="text-sm font-bold text-surface-500">
            {selectedItems.length} محدد
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedItems.length > 0 && (
            <button
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-error-600 bg-error-50 hover:bg-error-100 rounded-[16px] transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              حذف المحدد
            </button>
          )}

          <button
            onClick={() => setShowBulkEditModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-[16px] transition-colors shadow-sm"
          >
            <Edit3 className="w-4 h-4" />
            التعديل السريع
          </button>
        </div>
      </div>

      <div className="bg-white border-2 border-surface-100 rounded-[32px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-surface-50 border-b-2 border-surface-100">
                <th className="px-6 py-4 w-12"></th>
                <th className="px-6 py-4 text-sm font-bold text-surface-600">المنتج</th>
                <th className="px-6 py-4 text-sm font-bold text-surface-600">القسم</th>
                <th className="px-6 py-4 text-sm font-bold text-surface-600">السعر</th>
                <th className="px-6 py-4 text-sm font-bold text-surface-600">الحالة</th>
                <th className="px-6 py-4 text-sm font-bold text-surface-600">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-surface-100">
              {menuItems.map((item) => (
                <tr key={item.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <button onClick={() => handleToggleSelect(item.id)} className="text-surface-400 hover:text-primary-600 transition-colors">
                      {selectedItems.includes(item.id) ? (
                        <CheckSquare className="w-5 h-5 text-primary-600" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {item.image ? (
                        <div className="relative w-12 h-12 rounded-[12px] overflow-hidden border-2 border-surface-100 shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-surface-50 border-2 border-surface-100 rounded-[12px] flex items-center justify-center shrink-0">
                          <ImageIcon className="w-5 h-5 text-surface-300" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-surface-950 line-clamp-1">{item.name}</h4>
                        {item.description && <p className="text-xs text-surface-500 line-clamp-1 mt-0.5 max-w-[200px]">{item.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-100 text-surface-700 text-xs font-bold">
                      {item.category?.name || "غير محدد"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-primary-600">{Number(item.price)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(item.id, item.isAvailable)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          item.isAvailable ? 'bg-success-500' : 'bg-surface-300'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          item.isAvailable ? '-translate-x-6' : '-translate-x-1'
                        }`} />
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(item.id, item.isFeatured)}
                        title={item.isFeatured ? "إزالة من الأكثر مبيعاً" : "تعيين كأكثر مبيعاً"}
                        className={`p-1.5 rounded-full transition-colors ${
                          item.isFeatured 
                            ? 'bg-warning-50 text-warning-500' 
                            : 'bg-surface-100 text-surface-400 hover:text-warning-500'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${item.isFeatured ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {onEdit ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(item);
                          }}
                          title="تعديل"
                          className="p-2 text-surface-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      ) : null}
                      <DeleteConfirmButton action={async () => { await handleDelete(item.id); }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={showBulkDeleteConfirm}
        onCancel={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title="حذف الأصناف المحددة"
        description={`هل أنت متأكد من حذف ${selectedItems.length} صنف؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذف جميع البيانات المرتبطة بها.`}
        confirmText="نعم، احذف الأصناف"
        cancelText="إلغاء"
        isLoading={isBulkDeleting}
      />

      {showBulkEditModal && (
        <BulkEditModal 
          isOpen={showBulkEditModal} 
          onClose={() => setShowBulkEditModal(false)}
          categories={categories}
          storeId={storeId}
          initialItems={menuItems as any}
        />
      )}
    </div>
  );
}
