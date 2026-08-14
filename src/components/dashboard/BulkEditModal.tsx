"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Search, ImageIcon, Loader2, UploadCloud } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { getAllMenuItems } from "@/app/(dashboard)/dashboard/catalog/actions/get-all-menu-items";
import { quickUpdateMenuItem, quickUpdateMenuImage } from "@/app/(dashboard)/dashboard/catalog/actions/quick-update-menu-item";

type CategoryType = { id: string; name: string };
type MenuItem = {
  id: string;
  name: string;
  price: any;
  categoryId: string;
  image: string | null;
  category: { id: string; name: string };
};

// Row Component for individual state management
function BulkEditRow({ 
  item, 
  categories 
}: { 
  item: MenuItem; 
  categories: CategoryType[] 
}) {
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(Number(item.price));
  const [categoryId, setCategoryId] = useState(item.categoryId);
  const [image, setImage] = useState<string | null>(item.image);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save debounced handler for text fields
  const handleUpdate = async (field: 'name' | 'price' | 'categoryId', value: string | number) => {
    setIsUpdating(true);
    const data = { [field]: value };
    const res = await quickUpdateMenuItem(item.id, data);
    setIsUpdating(false);
    
    if (res.error) {
      toast.error(res.error);
      // Revert state if needed (simplified here)
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار صورة صالحة");
      return;
    }
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    
    const res = await quickUpdateMenuImage(item.id, formData);
    setIsUploading(false);
    
    if (res.error) {
      toast.error(res.error);
    } else if (res.imageUrl) {
      setImage(res.imageUrl);
      toast.success("تم تحديث الصورة بنجاح");
    }
  };

  return (
    <tr className="hover:bg-surface-50/50 transition-colors">
      <td className="p-3">
        <div 
          className={`relative w-16 h-16 rounded-[12px] overflow-hidden border-2 transition-all flex items-center justify-center cursor-pointer group
            ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-surface-200 bg-surface-50 hover:border-primary-400'}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          title="اسحب الصورة هنا أو اضغط للرفع"
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
          ) : image ? (
            <>
              <Image src={image} alt={name} fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <UploadCloud className="w-5 h-5 text-white" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center text-surface-400 group-hover:text-primary-500 transition-colors">
              <UploadCloud className="w-5 h-5" />
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
            }}
          />
        </div>
      </td>
      
      <td className="p-3">
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={(e) => {
            if (e.target.value !== item.name) {
              handleUpdate('name', e.target.value);
            }
          }}
          className="w-full p-2.5 bg-white border-2 border-surface-200 rounded-[12px] text-sm font-bold text-surface-900 focus:border-primary-500 outline-none transition-colors"
        />
      </td>
      
      <td className="p-3">
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            handleUpdate('categoryId', e.target.value);
          }}
          className="w-full p-2.5 bg-white border-2 border-surface-200 rounded-[12px] text-sm font-bold text-surface-900 focus:border-primary-500 outline-none transition-colors"
        >
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </td>
      
      <td className="p-3">
        <div className="relative">
          <input 
            type="number" 
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            onBlur={(e) => {
              if (Number(e.target.value) !== Number(item.price)) {
                handleUpdate('price', Number(e.target.value));
              }
            }}
            className="w-full p-2.5 bg-white border-2 border-surface-200 rounded-[12px] text-sm font-bold text-surface-900 focus:border-primary-500 outline-none transition-colors"
          />
          {isUpdating && (
            <Loader2 className="absolute end-3 top-3 w-4 h-4 text-surface-400 animate-spin" />
          )}
        </div>
      </td>
    </tr>
  );
}

export function BulkEditModal({ 
  isOpen, 
  onClose,
  categories,
  storeId
}: { 
  isOpen: boolean; 
  onClose: () => void;
  categories: CategoryType[];
  storeId?: string;
}) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      fetchItems();
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  const fetchItems = async () => {
    setIsLoading(true);
    const res = await getAllMenuItems();
    if (res.items) {
      setItems(res.items);
    } else {
      toast.error(res.error || "فشل في جلب المنتجات");
    }
    setIsLoading(false);
  };

  const filteredItems = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategoryId === "all" || item.categoryId === selectedCategoryId;
    return matchSearch && matchCategory;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-surface-100 bg-surface-50 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-surface-950">التعديل السريع للمنتجات</h2>
            <p className="text-sm text-surface-500 mt-1">
              قم بتعديل الاسم، السعر، القسم، أو اسحب وأفلت الصور ليتم الحفظ فوراً بدون الحاجة لزر حفظ.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-100 text-surface-600 hover:bg-surface-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 p-4 border-b-2 border-surface-100 shrink-0 bg-white">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute start-4 top-3.5 w-5 h-5 text-surface-400" />
            <input 
              type="text"
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full ps-11 pe-4 py-3 bg-surface-50 border-2 border-surface-100 rounded-[16px] text-sm font-bold text-surface-900 focus:border-primary-500 outline-none transition-colors"
            />
          </div>
          
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="px-4 py-3 bg-surface-50 border-2 border-surface-100 rounded-[16px] text-sm font-bold text-surface-900 focus:border-primary-500 outline-none transition-colors cursor-pointer"
          >
            <option value="all">جميع الأقسام</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Content (Table) */}
        <div className="flex-1 overflow-auto bg-surface-50/30">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-surface-400">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="font-bold">جاري تحميل المنتجات...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-surface-400">
              <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-bold">لم يتم العثور على منتجات</p>
            </div>
          ) : (
            <table className="w-full text-right relative">
              <thead className="sticky top-0 z-10 bg-surface-100 shadow-sm">
                <tr>
                  <th className="p-4 text-sm font-bold text-surface-600 w-24">الصورة</th>
                  <th className="p-4 text-sm font-bold text-surface-600 w-1/3">اسم المنتج</th>
                  <th className="p-4 text-sm font-bold text-surface-600 w-1/4">القسم</th>
                  <th className="p-4 text-sm font-bold text-surface-600 w-32">السعر</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-surface-100 bg-white">
                {filteredItems.map(item => (
                  <BulkEditRow 
                    key={item.id} 
                    item={item as any} 
                    categories={categories} 
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
