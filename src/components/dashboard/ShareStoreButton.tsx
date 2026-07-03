"use client";

import { useState } from "react";
import { Share2, Download, X, Copy, Check } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export function ShareStoreButton({ storeUrl, storeName, qrUrl }: { storeUrl: string, storeName?: string, qrUrl?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const downloadQRCode = () => {
    const canvas = document.getElementById("store-qr-code") as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${storeName || "store"}-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: storeName || "متجري",
          text: "اطلب الآن من متجرنا بكل سهولة!",
          url: storeUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(storeUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-white text-surface-700 font-bold rounded-2xl border-2 border-surface-200 hover:bg-surface-50 transition-colors flex items-center gap-2"
      >
        <Share2 className="w-5 h-5" />
        مشاركة المتجر
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-sm border-2 border-surface-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b-2 border-surface-100 bg-surface-50">
              <h3 className="font-black text-surface-950 text-xl">مشاركة المتجر</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 flex items-center justify-center bg-white border-2 border-surface-200 text-surface-500 hover:bg-surface-100 rounded-xl transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Code Section */}
            <div className="p-8 flex flex-col items-center justify-center bg-surface-50">
              <div className="relative group">
                <div className="p-5 bg-white rounded-[24px] border-2 border-surface-200">
                  <QRCodeCanvas
                    id="store-qr-code"
                    value={qrUrl || storeUrl}
                    size={200}
                    level="H"
                    includeMargin={true}
                    className="rounded-2xl"
                  />
                </div>
                {/* Download Button inside QR wrapper */}
                <button
                  onClick={downloadQRCode}
                  className="absolute -top-4 -end-4 w-12 h-12 flex items-center justify-center bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-colors opacity-100"
                  title="تنزيل رمز QR"
                >
                  <Download className="w-6 h-6" />
                </button>
              </div>
              <p className="text-surface-500 font-bold text-sm mt-6 text-center bg-surface-100 px-4 py-2 rounded-xl">
                امسح الرمز بكاميرا الهاتف لزيارة المتجر
              </p>
            </div>

            {/* Action Buttons */}
            <div className="p-5 border-t-2 border-surface-100 space-y-3 bg-white">
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-colors"
              >
                <Share2 className="w-5 h-5" />
                مشاركة مع الأصدقاء
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(storeUrl);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                className="w-full flex items-center justify-center gap-2 py-4 bg-surface-50 hover:bg-surface-100 text-surface-700 font-bold border-2 border-surface-200 rounded-2xl transition-colors"
              >
                {isCopied ? (
                  <>
                    <Check className="w-5 h-5 text-success-600" />
                    تم النسخ
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    نسخ الرابط
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
