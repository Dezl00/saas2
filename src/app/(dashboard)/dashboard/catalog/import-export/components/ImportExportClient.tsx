"use client";

import { useState } from "react";
import { Upload, Download, Loader2, AlertTriangle, FileSpreadsheet, Check } from "lucide-react";
import toast from "react-hot-toast";

export function ImportExportClient({ storeId }: { storeId: string }) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
      {/* Export Section */}
      <div className="bg-white border-2 border-surface-100 rounded-[32px] p-6 lg:p-8 hover:border-surface-200 transition-colors">
        <div className="w-16 h-16 bg-primary-100 rounded-[24px] flex items-center justify-center mb-6">
          <Download className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-black text-surface-950 mb-3">تصدير الأصناف</h2>
        <p className="text-surface-500 font-medium mb-8 leading-relaxed">
          قم بتنزيل كافة منتجاتك، التصنيفات، والإضافات في ملف إكسل واحد مرتب ومنظم. يمكنك التعديل عليه ورفعه مجدداً.
        </p>
        
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-primary-200 text-primary-600 font-bold rounded-[24px] hover:border-primary-600 transition-colors disabled:opacity-50"
        >
          {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
          تنزيل ملف الإكسل (Excel)
        </button>
      </div>

      {/* Import Section */}
      <div className="bg-white border-2 border-surface-100 rounded-[32px] p-6 lg:p-8 hover:border-surface-200 transition-colors">
        <div className="w-16 h-16 bg-success-100 rounded-[24px] flex items-center justify-center mb-6">
          <Upload className="w-8 h-8 text-success-600" />
        </div>
        <h2 className="text-2xl font-black text-surface-950 mb-3">استيراد الأصناف</h2>
        <p className="text-surface-500 font-medium mb-8 leading-relaxed">
          ارفع ملف الإكسل الذي قمت بتعديله أو الذي يحتوي على منتجاتك الجديدة لإضافتها دفعة واحدة.
        </p>
        
        <div className="relative">
          <input
            type="file"
            accept=".xlsx"
            onChange={handleImport}
            disabled={isImporting}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <div className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-success-600 text-white font-bold rounded-[24px] hover:bg-success-700 transition-colors pointer-events-none opacity-100">
            {isImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            {isImporting ? "جاري رفع البيانات..." : "اختر ملف Excel لرفعه"}
          </div>
        </div>

        <div className="mt-6 p-4 bg-warning-50 rounded-[24px] flex gap-3 text-warning-800 font-medium text-sm leading-relaxed border-2 border-warning-100">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p>
            تأكد من أن الأعمدة مطابقة للملف المصدر. سيتم تحديث المنتجات الموجودة مسبقاً إذا كان معرف المنتج (ID) موجوداً، وإلا سيتم إضافة منتجات جديدة.
          </p>
        </div>
      </div>
    </div>
  );
}
