"use client";

import { useState, useEffect } from "react";
import { CheckSquare, Square, AlertTriangle, AlertCircle, Loader2, X } from "lucide-react";

type PreviewProduct = {
  tempId: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  categoryName: string;
  categoryId: string;
  image: string;
  sortOrder: number;
  isActive: boolean;
  sizes: string;
  addons: string;
  isDuplicate: boolean;
  selected: boolean;
};

type PreviewCategory = {
  id: string;
  name: string;
};

type ImportPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (products: PreviewProduct[]) => void;
  previewData: {
    products: PreviewProduct[];
    categories: PreviewCategory[];
    duplicateCount: number;
  } | null;
  isConfirming: boolean;
};

export function ImportPreviewModal({ isOpen, onClose, onConfirm, previewData, isConfirming }: ImportPreviewModalProps) {
  const [products, setProducts] = useState<PreviewProduct[]>([]);

  useEffect(() => {
    if (previewData?.products) {
      setProducts(previewData.products);
    }
  }, [previewData]);

  if (!isOpen || !previewData) return null;

  const toggleSelect = (tempId: string) => {
    setProducts(prev => prev.map(p => p.tempId === tempId ? { ...p, selected: !p.selected } : p));
  };

  const toggleSelectAll = () => {
    const allSelected = products.every(p => p.selected);
    setProducts(prev => prev.map(p => ({ ...p, selected: !allSelected })));
  };

  const handleCategoryChange = (tempId: string, categoryId: string) => {
    setProducts(prev => prev.map(p => p.tempId === tempId ? { ...p, categoryId } : p));
  };

  const handleConfirm = () => {
    // Check if any selected product is missing a category
    const selectedProducts = products.filter(p => p.selected);
    const missingCategory = selectedProducts.some(p => !p.categoryId);
    
    if (missingCategory) {
      alert("يرجى اختيار قسم لجميع المنتجات المحددة قبل الإضافة.");
      return;
    }

    onConfirm(selectedProducts);
  };

  const selectedCount = products.filter(p => p.selected).length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-950/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-surface-100 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-surface-950">معاينة استيراد المنتجات</h3>
            <p className="text-sm text-surface-500 font-medium mt-1">
              تم العثور على {products.length} منتج. {previewData.duplicateCount > 0 && <span className="text-warning-600">({previewData.duplicateCount} منتجات مكررة)</span>}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full text-surface-500 hover:bg-surface-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-auto p-6 bg-surface-50">
          <div className="bg-white rounded-[16px] border-2 border-surface-200 overflow-hidden">
            <table className="w-full text-sm text-right">
              <thead className="bg-surface-50 border-b-2 border-surface-200 text-surface-600 font-bold">
                <tr>
                  <th className="p-4 w-12">
                    <button onClick={toggleSelectAll} className="text-surface-400 hover:text-primary-600">
                      {products.every(p => p.selected) ? <CheckSquare className="w-5 h-5 text-primary-600" /> : <Square className="w-5 h-5" />}
                    </button>
                  </th>
                  <th className="p-4">اسم المنتج</th>
                  <th className="p-4 w-24">السعر</th>
                  <th className="p-4 w-48">القسم بالملف</th>
                  <th className="p-4 w-48">اختيار القسم</th>
                  <th className="p-4 w-24 text-center">حالة التكرار</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr 
                    key={product.tempId} 
                    className={`border-b border-surface-100 last:border-0 hover:bg-surface-50 transition-colors ${!product.selected ? 'opacity-50' : ''}`}
                  >
                    <td className="p-4">
                      <button onClick={() => toggleSelect(product.tempId)} className="text-surface-400 hover:text-primary-600">
                        {product.selected ? <CheckSquare className="w-5 h-5 text-primary-600" /> : <Square className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="p-4 font-bold text-surface-950">{product.name}</td>
                    <td className="p-4 font-black text-primary-600">{product.price}</td>
                    <td className="p-4 font-medium text-surface-600">{product.categoryName || '-'}</td>
                    <td className="p-4">
                      <select
                        value={product.categoryId}
                        onChange={(e) => handleCategoryChange(product.tempId, e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border-2 outline-none text-sm font-medium ${!product.categoryId && product.selected ? 'border-error-300 bg-error-50' : 'border-surface-200 bg-white focus:border-primary-500'}`}
                      >
                        <option value="">اختر القسم...</option>
                        {previewData.categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      {product.isDuplicate ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-warning-50 text-warning-700 font-bold rounded-lg text-xs" title="هذا المنتج موجود بالفعل بنفس الاسم والسعر">
                          <AlertTriangle className="w-4 h-4" />
                          مكرر
                        </div>
                      ) : (
                        <span className="text-success-600 font-bold text-xs">جديد</span>
                      )}
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-surface-500">لا يوجد منتجات صالحة في الملف</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t-2 border-surface-100 flex items-center justify-between shrink-0">
          <div className="font-medium text-surface-600 flex items-center gap-2">
            {!products.every(p => p.categoryId || !p.selected) && (
              <span className="text-error-600 flex items-center gap-1 font-bold text-sm bg-error-50 px-3 py-1.5 rounded-xl">
                <AlertCircle className="w-4 h-4" />
                يجب اختيار الأقسام للمنتجات المحددة
              </span>
            )}
            {selectedCount > 0 && <span className="font-bold text-primary-600">تأكيد استيراد ({selectedCount}) منتج</span>}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isConfirming}
              className="px-6 py-3 font-bold text-surface-600 hover:bg-surface-100 rounded-[24px] transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleConfirm}
              disabled={isConfirming || selectedCount === 0}
              className="flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-bold rounded-[24px] hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {isConfirming ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {isConfirming ? "جاري الحفظ..." : "تأكيد واستيراد"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
