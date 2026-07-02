"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { usePushSubscription } from "./usePushSubscription";

interface PushNotificationPopupProps {
  storeId: string;
  enablePushPopup: boolean;
  primaryColor?: string;
}

export function PushNotificationPopup({ storeId, enablePushPopup, primaryColor }: PushNotificationPopupProps) {
  const [showPopup, setShowPopup] = useState(false);
  const { isSubscribed, isDismissed, isSupported, handleSubscribe, handleDismiss } = usePushSubscription(storeId, enablePushPopup);

  useEffect(() => {
    if (!enablePushPopup || !isSupported) return;

    // Show popup after 10 seconds if not subscribed and not dismissed
    const timer = setTimeout(() => {
      if (!isSubscribed && !isDismissed) {
        setShowPopup(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [enablePushPopup, isSubscribed, isDismissed, isSupported]);

  const onDismiss = () => {
    setShowPopup(false);
    handleDismiss();
  };

  const onSubscribe = async () => {
    await handleSubscribe();
    setShowPopup(false);
  };

  // If globally dismissed or subscribed from the banner, hide the popup immediately
  if (!showPopup || isSubscribed || isDismissed) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 relative">
        <button 
          onClick={onDismiss}
          className="absolute top-3 left-3 text-surface-400 hover:text-surface-600 transition-colors bg-surface-50 hover:bg-surface-100 rounded-full p-1"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-6 flex flex-col items-center text-center">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-primary-500/20"
            style={{ backgroundColor: primaryColor || "var(--color-primary-500, #2563eb)" }}
          >
            <Bell className="w-8 h-8 animate-bounce" />
          </div>
          
          <h4 className="font-bold text-surface-950 text-lg mb-2">
            فعّل الاشعارات ومتفوتش العروض الجديدة!
          </h4>
          <p className="text-sm text-surface-500 mb-6">
            كن أول من يعرف بجديدنا من منتجات وعروض وخصومات حصرية.
          </p>
          
          <div className="w-full flex flex-col gap-2">
            <button
              onClick={onSubscribe}
              className="w-full text-white text-sm font-bold py-3 px-4 rounded-xl hover:opacity-90 transition-opacity"
              style={{ backgroundColor: primaryColor || "var(--color-primary-500, #2563eb)" }}
            >
              تفعيل الاشعارات
            </button>
            <button
              onClick={onDismiss}
              className="w-full px-4 py-3 text-sm font-medium text-surface-500 bg-surface-100 hover:bg-surface-200 rounded-xl transition-colors"
            >
              لاحقاً
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
