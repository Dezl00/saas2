"use client";

import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2, Sparkles, CheckCircle2, ListChecks, CheckSquare, Square, FileText } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { importAIMenuItems } from "@/app/(dashboard)/dashboard/menu/ai-actions";

type ParsedCategory = {
  name: string;
  items: ParsedItem[];
};

type ParsedItem = {
  name: string;
  description: string;
  price: number;
  sizes?: { name: string; price: number }[];
  selected?: boolean; // added for UI
};

export function AIMenuScanner({ storeId }: { storeId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"image" | "pdf" | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [successResult, setSuccessResult] = useState<string | null>(null);
  
  // Review state
  const [parsedData, setParsedData] = useState<{ categories: ParsedCategory[] } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          
          const MAX_DIM = 1000;
          if (width > height && width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            } else {
              resolve(file);
            }
          }, "image/jpeg", 0.6);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/") && selectedFile.type !== "application/pdf") {
        toast.error("يرجى اختيار صورة أو ملف PDF صحيح");
        return;
      }
      
      setIsScanning(true); // Show loader while processing
      
      if (selectedFile.type === "application/pdf") {
        setFileType("pdf");
        setFile(selectedFile);
        setIsScanning(false);
      } else {
        setFileType("image");
        const compressedFile = await compressImage(selectedFile);
        setFile(compressedFile);
        
        const reader = new FileReader();
        reader.onload = (event) => {
          setImage(event.target?.result as string);
          setIsScanning(false);
        };
        reader.readAsDataURL(compressedFile);
      }
    }
  };

  // Progress text effect
  const [progressStep, setProgressStep] = useState(0);
  
  const handleScan = async () => {
    if (!file) return;

    setIsScanning(true);
    setProgressStep(1); // 1: Uploading/Compressing
    setSuccessResult(null);

    // Simulate progress steps
    const stepInterval = setInterval(() => {
      setProgressStep((prev) => {
        if (prev < 4) return prev + 1;
        return prev;
      });
    }, 2500);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/menu/ai-scan", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      clearInterval(stepInterval);

      if (!response.ok || result?.error) {
        toast.error(result?.error || "حدث خطأ غير متوقع");
        setIsScanning(false);
        setProgressStep(0);
      } else if (result?.success && result.data) {
      // Mark all items as selected by default
      const processedData = {
        categories: result.data.categories.map((c: any) => ({
          ...c,
          items: c.items?.map((i: any) => ({ ...i, selected: true })) || []
        }))
      };
      setParsedData(processedData);
      setIsScanning(false);
      setProgressStep(0);
    }
    } catch (error) {
      clearInterval(stepInterval);
      toast.error("حدث خطأ في الاتصال بالسيرفر. يرجى المحاولة مرة أخرى.");
      setIsScanning(false);
      setProgressStep(0);
    }
  };

  const handleToggleItem = (catIndex: number, itemIndex: number) => {
    if (!parsedData) return;
    const newData = { ...parsedData };
    newData.categories[catIndex].items[itemIndex].selected = !newData.categories[catIndex].items[itemIndex].selected;
    setParsedData(newData);
  };

  const handleImport = async () => {
    if (!parsedData) return;
    setIsImporting(true);

    // Filter only selected items
    const filteredData = {
      categories: parsedData.categories.map(c => ({
        ...c,
        items: c.items.filter(i => i.selected)
      })).filter(c => c.items.length > 0) // Remove empty categories
    };

    const result = await importAIMenuItems(filteredData, storeId);

    if (result?.error) {
      toast.error(result.error);
      setIsImporting(false);
    } else if (result?.success) {
      setSuccessResult(result.success);
      toast.success(result.success);
      setIsImporting(false);
      setTimeout(() => {
        handleClose();
      }, 3000);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setImage(null);
    setFile(null);
    setFileType(null);
    setIsScanning(false);
    setIsImporting(false);
    setSuccessResult(null);
    setParsedData(null);
    setProgressStep(0);
  };

  // Calculate totals
  const totalCategories = parsedData?.categories.length || 0;
  const totalItems = parsedData?.categories.reduce((acc, cat) => acc + cat.items.length, 0) || 0;
  const selectedItemsCount = parsedData?.categories.reduce((acc, cat) => acc + cat.items.filter(i => i.selected).length, 0) || 0;

  const progressMessages = [
    "",
    "جاري الاتصال بالذكاء الاصطناعي...",
    "جاري قراءة المنيو واستخراج البيانات...",
    "جاري تنسيق الأصناف والأسعار...",
    "على وشك الانتهاء..."
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-5 py-3 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all"
      >
        <Sparkles className="w-5 h-5" />
        مسح منيو بالذكاء الاصطناعي
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[32px] border-2 border-surface-200 overflow-hidden animate-zoom-in">
            <div className="px-6 py-5 border-b-2 border-surface-100 flex items-center justify-between bg-surface-50 shrink-0">
              <h3 className="text-xl font-black text-surface-950 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary-600" />
                المساعد الذكي للمنيو
              </h3>
              <button
                onClick={handleClose}
                disabled={isScanning || isImporting}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-50 border-2 border-surface-200 text-surface-500 hover:bg-surface-100 hover:text-surface-950 transition-colors disabled:opacity-50 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {!file ? (
                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                  <button 
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex-1 h-32 border-2 border-dashed border-primary-200 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
                  >
                    <Camera className="w-8 h-8 text-primary-600" />
                    <span className="font-bold text-primary-900">تصوير المنيو</span>
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 h-32 border-2 border-dashed border-primary-200 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-primary-600" />
                    <span className="font-bold text-primary-900">اختيار صورة أو ملف PDF</span>
                  </button>
                </div>
              ) : !parsedData ? (
                <div className="space-y-4">
                  <div className="relative w-full h-48 rounded-[24px] overflow-hidden border-2 border-surface-200 bg-surface-50 flex flex-col items-center justify-center">
                    {fileType === "image" && image ? (
                      <Image src={image} alt="Menu preview" fill className="object-cover" unoptimized />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 text-primary-600">
                        <FileText className="w-12 h-12" />
                        <span className="font-bold">تم إرفاق ملف PDF</span>
                      </div>
                    )}
                    
                    {!isScanning && !successResult && (
                      <button 
                        onClick={() => { setImage(null); setFile(null); setFileType(null); }}
                        className="absolute top-3 end-3 w-10 h-10 bg-error-600 hover:bg-error-700 rounded-xl text-white flex items-center justify-center transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                    
                    {isScanning && (
                      <div className="absolute inset-0 bg-primary-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full border-4 border-primary-300/30 border-t-primary-400 animate-spin mb-4" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-primary-200 animate-pulse mb-4" />
                          </div>
                        </div>
                        <p className="font-bold text-lg animate-pulse">{progressMessages[progressStep] || progressMessages[progressMessages.length - 1]}</p>
                        
                        <div className="w-full max-w-xs bg-primary-900/50 rounded-full h-1.5 mt-4 overflow-hidden">
                          <div 
                            className="bg-primary-400 h-1.5 rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${Math.min((progressStep / 4) * 100, 95)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleScan}
                    disabled={isScanning}
                    className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>الذكاء الاصطناعي يعمل...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>استخراج الأصناف والأسعار الآن</span>
                      </>
                    )}
                  </button>
                </div>
              ) : successResult ? (
                <div className="flex flex-col items-center justify-center text-success-600 py-10 animate-fade-in">
                  <CheckCircle2 className="w-16 h-16 mb-4" />
                  <p className="font-bold text-xl text-surface-950">{successResult}</p>
                </div>
              ) : (
                  <div className="space-y-6 animate-slide-up">
                  <div className="flex items-center justify-between bg-primary-50 p-5 rounded-2xl border-2 border-primary-100">
                    <div className="flex items-center gap-3">
                      <ListChecks className="w-8 h-8 text-primary-600" />
                      <div>
                        <p className="font-black text-primary-950">مراجعة الأصناف المستخرجة</p>
                        <p className="text-sm font-bold text-primary-600 mt-0.5">الرجاء تحديد الأصناف التي تريد إضافتها</p>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="text-sm font-black text-primary-950">{totalCategories} أقسام</p>
                      <p className="text-xs font-bold text-primary-700">{selectedItemsCount} من {totalItems} أصناف محددة</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {parsedData.categories.map((category, catIndex) => (
                      <div key={catIndex} className="bg-surface-50 border-2 border-surface-200 rounded-[24px] overflow-hidden">
                        <div className="px-5 py-4 bg-surface-100 border-b-2 border-surface-200 font-black text-surface-950 text-lg">
                          {category.name}
                        </div>
                        <div className="divide-y-2 divide-surface-200">
                          {category.items.map((item, itemIndex) => (
                            <div 
                              key={itemIndex} 
                              onClick={() => handleToggleItem(catIndex, itemIndex)}
                              className={`flex items-start gap-4 p-5 cursor-pointer hover:bg-primary-50 transition-colors ${!item.selected ? 'opacity-50 bg-surface-50 grayscale' : ''}`}
                            >
                              <button type="button" className="mt-1 shrink-0 text-primary-600">
                                {item.selected ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6 text-surface-400 border-2 rounded-md" />}
                              </button>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <p className="font-black text-surface-950 text-base">{item.name}</p>
                                  <span className="font-black text-primary-700 text-base">{item.price}</span>
                                </div>
                                {item.description && (
                                  <p className="text-sm font-medium text-surface-500 mt-1">{item.description}</p>
                                )}
                                {item.sizes && item.sizes.length > 0 && (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {item.sizes.map((size, sizeIndex) => (
                                      <div key={sizeIndex} className="bg-primary-50 border-2 border-primary-100 rounded-xl px-3 py-1.5 flex items-center gap-2 text-sm">
                                        <span className="text-primary-700 font-bold">{size.name}</span>
                                        <span className="text-primary-900 font-black">{size.price}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <input
                type="file"
                ref={cameraInputRef}
                onChange={handleFileChange}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                className="hidden"
              />
            </div>
            
            {/* Footer actions for review step */}
            {parsedData && !successResult && (
              <div className="p-6 border-t-2 border-surface-200 bg-surface-50 flex flex-col sm:flex-row gap-3 shrink-0">
                <button
                  onClick={() => setParsedData(null)}
                  disabled={isImporting}
                  className="flex-1 py-4 px-4 rounded-2xl text-base font-bold text-surface-700 bg-white border-2 border-surface-200 hover:bg-surface-50 transition-colors disabled:opacity-50"
                >
                  إلغاء وإعادة المحاولة
                </button>
                <button
                  onClick={handleImport}
                  disabled={isImporting || selectedItemsCount === 0}
                  className="flex-1 py-4 px-4 rounded-2xl text-base font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isImporting ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    `تأكيد وإضافة (${selectedItemsCount})`
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
