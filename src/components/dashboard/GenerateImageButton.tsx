"use client";

import { useState } from "react";
import { Sparkles, Dices, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function GenerateImageButton({ itemId, hasImage }: { itemId: string, hasImage: boolean }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    setIsGenerating(true);
    const toastId = toast.loading("جاري توليد الصورة السحرية...");

    try {
      // Send a random seed to ensure a different image if regenerated
      const seed = Math.floor(Math.random() * 1000000);
      
      const res = await fetch(`/api/menu/items/${itemId}/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل التوليد");
      }

      toast.success("تم توليد الصورة وحفظها بنجاح!", { id: toastId });
      // Refresh the page to show the new image smoothly
      router.refresh();
      
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={isGenerating}
      title={hasImage ? "توليد صورة أخرى" : "توليد صورة بالذكاء الاصطناعي"}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-[24px] text-sm font-bold border-2 transition-colors shrink-0 ${
        hasImage 
          ? "bg-surface-50 border-surface-200 text-surface-700 hover:bg-surface-100" 
          : "bg-primary-50 border-primary-200 text-primary-700 hover:bg-primary-100"
      } disabled:opacity-50`}
    >
      {isGenerating ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : hasImage ? (
        <Dices className="w-5 h-5 text-purple-600" />
      ) : (
        <Sparkles className="w-5 h-5 text-yellow-500" />
      )}
      <span className="hidden sm:inline">{hasImage ? "صورة أخرى" : "توليد صورة"}</span>
    </button>
  );
}
