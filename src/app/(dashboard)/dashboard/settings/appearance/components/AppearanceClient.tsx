"use client";

import { useState } from "react";
import { updateStoreAppearance } from "../actions";
import { Loader2, Check, Palette, Type } from "lucide-react";
import toast from "react-hot-toast";

const THEMES = [
  { id: "classic", name: "الثيم الكلاسيكي (الافتراضي)", description: "تصميم مشرق وبسيط" },
  { id: "dark_solid", name: "الثيم الداكن (Dark Solid)", description: "خلفية سوداء بالكامل مع إبراز لون الهوية" },
];

const FONTS = [
  { id: "Tajawal", name: "تجوال", cssClass: "font-tajawal" },
  { id: "Almarai", name: "المراعي", cssClass: "font-almarai" },
  { id: "Cairo", name: "القاهرة", cssClass: "font-cairo" },
  { id: "Readex Pro", name: "ريدكس برو", cssClass: "font-readex" },
  { id: "IBM Plex Sans Arabic", name: "آي بي إم بلكس", cssClass: "font-ibm" },
  { id: "Changa", name: "تشانجا", cssClass: "font-changa" },
  { id: "Amiri", name: "أميري", cssClass: "font-amiri" },
  { id: "El Messiri", name: "المسيري", cssClass: "font-messiri" },
  { id: "Aref Ruqaa", name: "عارف رقعة", cssClass: "font-ruqaa" },
  { id: "Lalezar", name: "لالزار", cssClass: "font-lalezar" },
];

export function AppearanceClient({ currentFont, currentTheme }: { currentFont: string, currentTheme: string }) {
  const [selectedFont, setSelectedFont] = useState(currentFont || "Tajawal");
  const [selectedTheme, setSelectedTheme] = useState(currentTheme || "classic");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateStoreAppearance(selectedFont, selectedTheme);
      toast.success("تم تحديث المظهر بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء التحديث");
    } finally {
      setIsSaving(false);
    }
  };

  const fontsUrl = "https://fonts.googleapis.com/css2?family=Almarai:wght@400;700&family=Amiri:wght@400;700&family=Aref+Ruqaa:wght@400;700&family=Cairo:wght@400;700&family=Changa:wght@400;700&family=El+Messiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;700&family=Lalezar&family=Readex+Pro:wght@400;700&family=Tajawal:wght@400;700&display=swap";

  const hasChanges = selectedFont !== currentFont || selectedTheme !== currentTheme;

  return (
    <div className="space-y-6">
      <link href={fontsUrl} rel="stylesheet" />
      
      {/* Themes Section */}
      <div className="bg-white border-2 border-surface-100 rounded-[32px] p-6 lg:p-8">
        <h3 className="text-xl font-bold text-surface-950 mb-6 flex items-center gap-2">
          <Palette className="w-6 h-6 text-primary-500" />
          اختر ثيم المتجر
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {THEMES.map((theme) => (
            <div
              key={theme.id}
              onClick={() => setSelectedTheme(theme.id)}
              className={`relative cursor-pointer rounded-[24px] p-5 transition-colors border-2 ${
                selectedTheme === theme.id 
                  ? "border-primary-500 bg-primary-50" 
                  : "border-surface-200 hover:border-primary-200 bg-white"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-surface-950 text-lg">{theme.name}</h3>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${selectedTheme === theme.id ? "bg-primary-500" : "bg-surface-100"}`}>
                  {selectedTheme === theme.id && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>
              <p className="text-surface-500 text-sm">
                {theme.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Fonts Section */}
      <div className="bg-white border-2 border-surface-100 rounded-[32px] p-6 lg:p-8">
        <h3 className="text-xl font-bold text-surface-950 mb-6 flex items-center gap-2">
          <Type className="w-6 h-6 text-primary-500" />
          اختر خط المتجر
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FONTS.map((font) => (
            <div
              key={font.id}
              onClick={() => setSelectedFont(font.id)}
              className={`relative cursor-pointer rounded-[24px] p-5 transition-colors border-2 ${
                selectedFont === font.id 
                  ? "border-primary-500 bg-primary-50" 
                  : "border-surface-200 hover:border-primary-200 bg-white"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-surface-950 text-lg">{font.name}</h3>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${selectedFont === font.id ? "bg-primary-500" : "bg-surface-100"}`}>
                  {selectedFont === font.id && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>
              <p className={`text-surface-600 text-xl mt-2 ${font.cssClass}`} style={{ fontFamily: `"${font.id}", sans-serif` }}>
                أهلاً بك في متجرنا
              </p>
              <p className={`text-surface-400 text-sm mt-2 ${font.cssClass}`} style={{ fontFamily: `"${font.id}", sans-serif` }}>
                وجبات لذيذة وتوصيل سريع!
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="w-full sm:w-auto py-4 px-10 bg-primary-600 hover:bg-primary-700 text-white rounded-[24px] font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            حفظ إعدادات المظهر
          </button>
        </div>
      </div>
    </div>
  );
}
