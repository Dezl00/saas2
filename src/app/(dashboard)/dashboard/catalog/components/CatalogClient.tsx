"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { MenuItemForm, MenuItemData } from "@/components/dashboard/MenuItemForm";
import { MenuItemsTable } from "@/components/dashboard/MenuItemsTable";
import { Pagination } from "@/components/ui/Pagination";

export function CatalogClient({
  menuItems,
  categories,
  storeId,
}: {
  menuItems: any[];
  categories: { id: string; name: string }[];
  storeId: string;
}) {
  const [editItem, setEditItem] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, selectedCategory]);

  const totalPages = Math.ceil(filteredItems.length / pageSize);
  const currentItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, selectedCategory]);

  const handleEdit = (item: any) => {
    setEditItem(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSuccess = () => {
    setEditItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar for Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-[24px] border-2 border-surface-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input 
            type="text" 
            placeholder="ابحث عن منتج..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-12 py-3 bg-surface-50 border-2 border-surface-100 rounded-[16px] focus:border-primary-500 outline-none font-bold text-surface-900 transition-colors"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto bg-surface-50 px-4 py-3 rounded-[16px] border-2 border-surface-100 shrink-0">
          <Filter className="w-5 h-5 text-surface-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-transparent text-sm font-bold text-surface-900 outline-none cursor-pointer border-none focus:ring-0 w-full"
          >
            <option value="all">جميع الأقسام</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-6">
          <div className="bg-white border-2 border-surface-100 rounded-[32px] p-6 lg:p-8 shadow-sm">
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

        {/* Table */}
        <div className="lg:col-span-7 xl:col-span-8">
          <MenuItemsTable 
            menuItems={currentItems} 
            categories={categories} 
            storeId={storeId}
            onEdit={handleEdit}
          />
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    setCurrentPage(i + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-10 h-10 rounded-[14px] font-bold transition-colors ${currentPage === i + 1 ? 'bg-primary-600 text-white' : 'bg-white text-surface-600 border-2 border-surface-100 hover:bg-surface-50'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
