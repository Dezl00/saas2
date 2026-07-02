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
    <div className="fixed bottom-4 left-4 z-50 w-[340px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-surface-100 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="p-4 flex items-start gap-3">
        <div 
          className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white"
          style={{ backgroundColor: primaryColor || "var(--color-primary-500, #2563eb)" }}
        >
          <Bell className="w-5 h-5 animate-bounce" />
        </div>
        <div className="flex-1 pt-1">
          <h4 className="font-bold text-surface-900 text-sm mb-1">فعّل الاشعارات ومتفوتش العروض الجديدة!</h4>
          <p className="text-xs text-surface-500 mb-3">كن أول من يعرف بجديدنا من منتجات وعروض حصرية.</p>
          <div className="flex items-center gap-2">
            <button
              onClick={onSubscribe}
              className="flex-1 text-white text-xs font-bold py-2 px-3 rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: primaryColor || "var(--color-primary-500, #2563eb)" }}
            >
              تفعيل الاشعارات
            </button>
            <button
              onClick={onDismiss}
              className="px-3 py-2 text-xs font-medium text-surface-500 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors"
            >
              لاحقاً
            </button>
          </div>
        </div>
        <button 
          onClick={onDismiss}
          className="text-surface-400 hover:text-surface-600 transition-colors absolute top-3 left-3"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
