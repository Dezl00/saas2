"use client";

import { useState, useEffect } from "react";
import { Palette, Type, CheckCircle2, Loader2, PaintBucket } from "lucide-react";
import { updateAppearanceSettings } from "./actions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function AppearanceClient({
  initialTheme,
  initialFont,
  initialCustomColor,
}: {
  initialTheme: string;
  initialFont: string;
  initialCustomColor: string | null;
}) {
  const [selectedTheme, setSelectedTheme] = useState(initialTheme || "blue");
  const [selectedFont, setSelectedFont] = useState(initialFont || "cairo");
  const [customColor, setCustomColor] = useState(initialCustomColor || "#2563eb");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const themes = [
    { id: "blue", name: "أزرق (الافتراضي)", color: "bg-blue-600" },
    { id: "emerald", name: "زمردي", color: "bg-emerald-600" },
    { id: "violet", name: "بنفسجي", color: "bg-violet-600" },
    { id: "rose", name: "وردي", color: "bg-rose-600" },
    { id: "amber", name: "عنبري", color: "bg-amber-500" },
    { id: "custom", name: "لون مخصص", color: "bg-gradient-to-br from-gray-200 to-gray-400" },
  ];

  const fonts = [
    { id: "cairo", name: "Cairo (الافتراضي)", cssClass: "font-cairo" },
    { id: "tajawal", name: "Tajawal", cssClass: "font-tajawal" },
    { id: "almarai", name: "Almarai", cssClass: "font-almarai" },
    { id: "readex", name: "Readex Pro", cssClass: "font-readex" },
    { id: "ibm", name: "IBM Plex Sans Arabic", cssClass: "font-ibm" },
    { id: "changa", name: "Changa", cssClass: "font-changa" },
    { id: "amiri", name: "Amiri", cssClass: "font-amiri" },
    { id: "messiri", name: "El Messiri", cssClass: "font-messiri" },
    { id: "ruqaa", name: "Aref Ruqaa", cssClass: "font-ruqaa" },
    { id: "lalezar", name: "Lalezar", cssClass: "font-lalezar" },
  ];

  // Convert HEX to OKLCH approximation or just inject simple CSS variable overrides
  // Since Tailwind v4 OKLCH is used, providing a simple fallback using rgb/hex for custom color might break or we can just redefine the primary tokens using hex directly since modern browsers support it
  const hexToRgb = (hex: string) => {
    let r = 0, g = 0, b = 0;
    if (hex.length == 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length == 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }
    return `${r} ${g} ${b}`;
  };

  useEffect(() => {
    // Live Preview Logic
    const root = document.documentElement;
    const dashboardLayout = document.querySelector(".dashboard-layout");

    if (dashboardLayout) {
      // Remove old theme and font classes
      themes.forEach((t) => dashboardLayout.classList.remove(`theme-${t.id}`));
      fonts.forEach((f) => dashboardLayout.classList.remove(f.cssClass));

      // Add new classes
      dashboardLayout.classList.add(`theme-${selectedTheme}`);
      dashboardLayout.classList.add(`font-${selectedFont}`);
    }

    if (selectedTheme === "custom") {
      const rgb = hexToRgb(customColor);
      root.style.setProperty("--color-primary-50", `color-mix(in srgb, ${customColor} 10%, white)`);
      root.style.setProperty("--color-primary-100", `color-mix(in srgb, ${customColor} 20%, white)`);
      root.style.setProperty("--color-primary-200", `color-mix(in srgb, ${customColor} 40%, white)`);
      root.style.setProperty("--color-primary-300", `color-mix(in srgb, ${customColor} 60%, white)`);
      root.style.setProperty("--color-primary-400", `color-mix(in srgb, ${customColor} 80%, white)`);
      root.style.setProperty("--color-primary-500", customColor);
      root.style.setProperty("--color-primary-600", `color-mix(in srgb, ${customColor} 80%, black)`);
      root.style.setProperty("--color-primary-700", `color-mix(in srgb, ${customColor} 60%, black)`);
      root.style.setProperty("--color-primary-800", `color-mix(in srgb, ${customColor} 40%, black)`);
      root.style.setProperty("--color-primary-900", `color-mix(in srgb, ${customColor} 20%, black)`);
      root.style.setProperty("--color-primary-950", `color-mix(in srgb, ${customColor} 10%, black)`);
    } else {
      // Clear custom styles
      root.style.removeProperty("--color-primary-50");
      root.style.removeProperty("--color-primary-100");
      root.style.removeProperty("--color-primary-200");
      root.style.removeProperty("--color-primary-300");
      root.style.removeProperty("--color-primary-400");
      root.style.removeProperty("--color-primary-500");
      root.style.removeProperty("--color-primary-600");
      root.style.removeProperty("--color-primary-700");
      root.style.removeProperty("--color-primary-800");
      root.style.removeProperty("--color-primary-900");
      root.style.removeProperty("--color-primary-950");
    }

  }, [selectedTheme, selectedFont, customColor]);

  const hasChanges =
    selectedTheme !== initialTheme ||
    selectedFont !== initialFont ||
    (selectedTheme === "custom" && customColor !== initialCustomColor);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("dashboardTheme", selectedTheme);
      formData.append("dashboardFont", selectedFont);
      if (selectedTheme === "custom") {
        formData.append("dashboardCustomColor", customColor);
      }

      await updateAppearanceSettings(formData);
      toast.success("تم حفظ إعدادات المظهر بنجاح!");
      router.refresh();
    } catch (error) {
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-6 md:p-8">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-surface-950 mb-2">إعدادات المظهر الشاملة (معاينة حية)</h2>
        <p className="text-surface-500 text-sm font-medium">
          أي تغيير تقوم به هنا سيتم تطبيقه فوراً لتشاهد كيف سيبدو، اضغط "حفظ" لتأكيده.
        </p>
      </div>

      <div className="space-y-10 max-w-4xl">
        {/* Theme Color Selection */}
        <div>
          <h3 className="text-lg font-bold text-surface-950 mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary-500" />
            اللون الأساسي للوحة التحكم
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {themes.map((theme) => (
              <label
                key={theme.id}
                className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                  selectedTheme === theme.id
                    ? "border-primary-500 bg-primary-50/50 scale-[1.02] shadow-sm"
                    : "border-surface-200 bg-surface-50 hover:bg-surface-100 hover:border-surface-300"
                }`}
              >
                <input
                  type="radio"
                  name="dashboardTheme"
                  value={theme.id}
                  checked={selectedTheme === theme.id}
                  onChange={() => setSelectedTheme(theme.id)}
                  className="sr-only"
                />
                {theme.id === "custom" ? (
                  <div className="w-8 h-8 rounded-full mb-3 shadow-sm flex items-center justify-center bg-surface-200">
                    <PaintBucket className="w-4 h-4 text-surface-600" />
                  </div>
                ) : (
                  <div className={`w-8 h-8 rounded-full mb-3 shadow-sm ${theme.color}`} />
                )}
                <span className="text-xs font-bold text-surface-950 text-center">{theme.name}</span>
                {selectedTheme === theme.id && (
                  <div className="absolute top-2 right-2 text-primary-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </label>
            ))}
          </div>
          
          {selectedTheme === "custom" && (
            <div className="mt-6 p-4 bg-surface-50 border border-surface-200 rounded-2xl flex items-center gap-4 animate-fade-in">
              <label className="text-sm font-bold text-surface-950">اختر اللون المفضل:</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                />
                <div className="text-xs text-surface-500 font-mono" dir="ltr">{customColor.toUpperCase()}</div>
              </div>
            </div>
          )}
        </div>

        <hr className="border-surface-100" />

        {/* Font Selection */}
        <div>
          <h3 className="text-lg font-bold text-surface-950 mb-4 flex items-center gap-2">
            <Type className="w-5 h-5 text-primary-500" />
            خط لوحة التحكم
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {fonts.map((font) => (
              <label
                key={font.id}
                className={`relative flex flex-col p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                  selectedFont === font.id
                    ? "border-primary-500 bg-primary-50/50 scale-[1.02] shadow-sm"
                    : "border-surface-200 bg-surface-50 hover:bg-surface-100 hover:border-surface-300"
                }`}
              >
                <input
                  type="radio"
                  name="dashboardFont"
                  value={font.id}
                  checked={selectedFont === font.id}
                  onChange={() => setSelectedFont(font.id)}
                  className="sr-only"
                />
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-base font-bold text-surface-950 ${font.cssClass}`}>
                    {font.name}
                  </span>
                  {selectedFont === font.id && (
                    <div className="text-primary-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <p className={`text-surface-500 text-sm mt-1 ${font.cssClass}`}>
                  تجربة الخط - لوحة التحكم
                </p>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="w-full sm:w-auto min-w-[240px] py-4 px-8 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            تطبيق وحفظ التعديلات
          </button>
        </div>
      </div>
    </div>
  );
}
