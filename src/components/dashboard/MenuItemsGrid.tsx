"use client";

import { useState } from "react";
import { ImageIcon, Trash2, CheckSquare, Square, Loader2, PackageOpen, Star } from "lucide-react";
import { toggleMenuItemStatus } from "@/app/(dashboard)/dashboard/catalog/actions/toggle-menu-item-status";
import { toggleFeaturedMenuItem } from "@/app/(dashboard)/dashboard/catalog/actions/toggle-featured-menu-item";
import { deleteMenuItem } from "@/app/(dashboard)/dashboard/catalog/actions/delete-menu-item";
import { bulkDeleteMenuItems } from "@/app/(dashboard)/dashboard/catalog/actions/bulk-delete-menu-items";
import { MenuItemEditButton } from "@/components/dashboard/MenuItemEditButton";
import { DeleteConfirmButton } from "@/components/dashboard/DeleteConfirmButton";
import { GenerateImageButton } from "@/components/dashboard/GenerateImageButton";
import toast from "react-hot-toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import Image from "next/image";

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

export function MenuItemsGrid({ 
  menuItems: initialMenuItems, 
  categories,
  storeId
}: { 
  menuItems: MenuItemType[], 
  categories: CategoryType[],
  storeId?: string 
}) {
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  
  // Sync state when props change
  import("react").then(React => {
    React.useEffect(() => {
      setMenuItems(initialMenuItems);
    }, [initialMenuItems]);
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const toggleSelectAll = () => {
    if (selectedIds.size === menuItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(menuItems.map(item => item.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    setIsDeletingBulk(true);
    const result = await bulkDeleteMenuItems(Array.from(selectedIds), storeId);
    
    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
      toast.success(result.success);
      setSelectedIds(new Set());
    }
    setIsDeletingBulk(false);
    setShowBulkConfirm(false);
  };

  const handleToggleAvailable = async (e: React.MouseEvent, id: string, currentStatus: boolean) => {
    e.stopPropagation();
    const prev = [...menuItems];
    setMenuItems(menuItems.map(item => item.id === id ? { ...item, isAvailable: !currentStatus } : item));
    const result = await toggleMenuItemStatus(id, currentStatus, storeId);
    if (result?.error) {
      toast.error(result.error);
      setMenuItems(prev); // revert
    }
  };

  const handleToggleFeatured = async (e: React.MouseEvent, id: string, currentStatus: boolean) => {
    e.stopPropagation();
    const prev = [...menuItems];
    setMenuItems(menuItems.map(item => item.id === id ? { ...item, isFeatured: !currentStatus } : item));
    const result = await toggleFeaturedMenuItem(id, currentStatus, storeId);
    if (result?.error) {
      toast.error(result.error);
      setMenuItems(prev); // revert
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={showBulkConfirm}
        title="تأكيد الحذف المجمع"
        description={`هل أنت متأكد من حذف ${selectedIds.size} صنف؟ لا يمكن التراجع عن هذا الإجراء.`}
        onConfirm={handleBulkDelete}
        onCancel={() => setShowBulkConfirm(false)}
        isLoading={isDeletingBulk}
      />
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border-2 border-surface-100 p-4 rounded-[24px]">
        <button 
          onClick={toggleSelectAll} 
          className="flex items-center gap-2 text-surface-600 hover:text-primary-600 transition-colors font-bold px-3 py-2 rounded-[24px] hover:bg-primary-50"
        >
          {selectedIds.size === menuItems.length && menuItems.length > 0 ? (
            <CheckSquare className="w-5 h-5 text-primary-600" />
          ) : (
            <Square className="w-5 h-5" />
          )}
          تحديد الكل
        </button>
        
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-4 animate-fade-in">
            <span className="font-bold text-primary-600 bg-primary-50 px-4 py-2 rounded-[24px]">
              تم تحديد {selectedIds.size}
            </span>
            <button
              onClick={() => setShowBulkConfirm(true)}
              disabled={isDeletingBulk}
              className="flex items-center gap-2 px-6 py-2 bg-error-600 text-white rounded-[24px] font-bold hover:bg-error-700 transition-colors disabled:opacity-50"
            >
              {isDeletingBulk ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
              حذف المحدد
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      {menuItems.length === 0 ? (
        <div className="bg-surface-50 border-2 border-surface-100 rounded-[32px] p-12 text-center flex flex-col items-center justify-center">
          <PackageOpen className="w-16 h-16 text-surface-300 mb-4" />
          <p className="text-lg font-medium text-surface-500">لم تقم بإضافة أي أصناف بعد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
          {menuItems.map((item) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <div 
                key={item.id} 
                className={`flex gap-4 p-4 rounded-[24px] border-2 transition-all cursor-pointer min-w-0 ${
                  isSelected 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-surface-100 bg-white hover:border-surface-200'
                }`}
                onClick={() => toggleSelectRow(item.id)}
              >
                {/* Image */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-[24px] overflow-hidden bg-surface-100">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-surface-400">
                      <ImageIcon className="w-8 h-8 opacity-50" />
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary-600/20 flex items-center justify-center">
                      <CheckSquare className="w-6 h-6 text-white drop-shadow-md" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-grow justify-between py-1 min-w-0">
                  <div className="min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h4 className="font-bold text-surface-950 text-base sm:text-lg leading-tight line-clamp-1 break-words">{item.name}</h4>
                      <span className="font-black text-primary-600 shrink-0 text-sm sm:text-base">{Number(item.price).toFixed(2)}</span>
                    </div>
                    <span className="inline-block px-2.5 py-1 bg-surface-100 text-surface-600 text-xs font-bold rounded-lg mb-2 max-w-full truncate">
                      {item.category.name}
                    </span>
                    {item.description && (
                      <p className="text-xs text-surface-500 line-clamp-1 font-medium break-words">{item.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t-2 border-surface-100/50 flex-wrap gap-2" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleToggleAvailable(e, item.id, item.isAvailable)}
                        title={item.isAvailable ? "متوفر" : "غير متوفر"}
                        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                          item.isAvailable ? 'bg-success-500' : 'bg-surface-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            item.isAvailable ? '-translate-x-6' : '-translate-x-1'
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleToggleFeatured(e, item.id, item.isFeatured)}
                        title={item.isFeatured ? "إزالة من الأكثر مبيعاً" : "تعيين كـ الأكثر مبيعاً"}
                        className={`flex items-center justify-center w-8 h-8 rounded-xl transition-colors border shrink-0 ${
                          item.isFeatured 
                            ? 'bg-yellow-50 border-yellow-200 text-yellow-500 hover:bg-yellow-100' 
                            : 'bg-surface-50 border-surface-200 text-surface-400 hover:bg-surface-100 hover:text-yellow-500'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${item.isFeatured ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <GenerateImageButton itemId={item.id} hasImage={!!item.image} />
                      <MenuItemEditButton itemId={item.id} />
                      <DeleteConfirmButton action={deleteMenuItem.bind(null, item.id, storeId) as any} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
