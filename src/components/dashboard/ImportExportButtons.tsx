"use client";

import { useState } from "react";
import { Upload, Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ImportPreviewModal } from "./ImportPreviewModal";

export function ImportExportButtons() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  
  const router = useRouter();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/menu/export");
      if (!response.ok) throw new Error("فشل التصدير");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `menu_export_${new Date().getTime()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("تم تصدير المنيو بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء تصدير البيانات");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      toast.error("يجب اختيار ملف Excel (.xlsx)");
      return;
    }

    setIsImporting(true);
    const toastId = toast.loading("جاري تحليل الملف المرفوع...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/menu/import/preview", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "فشل تحليل الملف");
      }
      
      setPreviewData(data);
      setIsPreviewOpen(true);
      toast.dismiss(toastId);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تحليل البيانات", { id: toastId });
      console.error(error);
    } finally {
      setIsImporting(false);
      e.target.value = ''; // reset input
    }
  };

  const handleConfirmImport = async (selectedProducts: any[]) => {
    setIsConfirming(true);
    const toastId = toast.loading("جاري حفظ المنتجات...");
    
    try {
      const response = await fetch("/api/menu/import/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: selectedProducts }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "فشل الحفظ");
      }
      
      toast.success(`تم استيراد ${data.count} منتج بنجاح!`, { id: toastId });
      setIsPreviewOpen(false);
      setPreviewData(null);
      router.refresh(); // Refresh page to show new products
      
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء حفظ المنتجات", { id: toastId });
      console.error(error);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <>
      <ImportPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        previewData={previewData}
        onConfirm={handleConfirmImport}
        isConfirming={isConfirming}
      />
      
      <div className="flex items-center gap-2">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-surface-200 text-surface-600 font-bold rounded-[24px] hover:border-primary-200 hover:text-primary-600 transition-colors disabled:opacity-50"
          title="تصدير أو تحميل نموذج فارغ"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          <span className="hidden sm:inline">تصدير / تحميل النموذج</span>
        </button>

        <div className="relative">
          <input
            type="file"
            accept=".xlsx"
            onChange={handleImport}
            disabled={isImporting}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            title="استيراد المنتجات"
          />
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-surface-200 text-surface-600 font-bold rounded-[24px] hover:border-success-200 hover:text-success-600 transition-colors pointer-events-none opacity-100">
            {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span className="hidden sm:inline">استيراد المنتجات</span>
          </div>
        </div>
      </div>
    </>
  );
}
