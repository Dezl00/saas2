"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { MenuItemForm, MenuItemData } from "@/components/dashboard/MenuItemForm";
import { MenuItemsTable } from "@/components/dashboard/MenuItemsTable";
import { Pagination } from "@/components/ui/Pagination";

export function CatalogClient({
  menuItems,
  categories,
  storeId,
  totalPages
}: {
  menuItems: any[];
  categories: { id: string; name: string }[];
  storeId: string;
  totalPages: number;
}) {
  const [editItem, setEditItem] = useState<any | null>(null);

  // When menuItems change from server (e.g. after revalidatePath), 
  // we could optionally keep the editItem updated, or leave it.
  
  const handleEdit = (item: any) => {
    setEditItem(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSuccess = () => {
    setEditItem(null);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* نموذج إضافة / تعديل صنف */}
      <div className="xl:col-span-1">
        <div className="bg-white border-2 border-surface-100 rounded-[32px] p-6 lg:p-8 sticky top-36 shadow-sm">
          <h3 className="text-xl font-bold text-surface-950 mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary-600" />
            {editItem ? "تعديل الصنف" : "إضافة صنف جديد"}
          </h3>
          
          {categories.length === 0 ? (
            <div className="p-4 bg-warning-50 text-warning-800 rounded-[24px] text-sm font-bold border-2 border-warning-100 leading-relaxed">
              يجب إضافة "قسم" واحد على الأقل قبل إضافة الأصناف. يرجى الذهاب لصفحة الأقسام أولاً.
            </div>
          ) : (
            <MenuItemForm 
              key={editItem ? editItem.id : 'new'}
              categories={categories} 
              storeId={storeId}
              onSuccess={handleSuccess}
              initialData={editItem ? {
                ...editItem,
                price: editItem.price.toString(),
                sizes: editItem.sizes.map((s: any) => ({ ...s, price: s.price.toString() })),
                addons: editItem.addons.map((a: any) => ({ ...a, price: a.price.toString() }))
              } : undefined}
            />
          )}
        </div>
      </div>

      {/* قائمة الأصناف */}
      <div className="xl:col-span-2">
        <MenuItemsTable 
          menuItems={menuItems} 
          categories={categories} 
          storeId={storeId}
          onEdit={handleEdit}
        />
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination totalPages={totalPages} />
          </div>
        )}
      </div>
    </div>
  );
}
