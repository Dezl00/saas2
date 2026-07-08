"use client";

import { useState } from "react";
import { Upload, Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function ImportExportButtons() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
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
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/menu/import", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "فشل الاستيراد");
      }
      
      toast.success(`تم استيراد ${data.count} عنصر بنجاح`);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء استيراد البيانات");
      console.error(error);
    } finally {
      setIsImporting(false);
      e.target.value = ''; // reset input
    }
  };

  return (
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
  );
}
