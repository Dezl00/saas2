"use client";

import { Bell } from "lucide-react";
import { usePushSubscription } from "./usePushSubscription";

interface PushNotificationHeroBannerProps {
  storeId: string;
  enablePushPopup: boolean;
  primaryColor?: string;
}

export function PushNotificationHeroBanner({ storeId, enablePushPopup, primaryColor }: PushNotificationHeroBannerProps) {
  const { isSubscribed, isSupported, handleSubscribe } = usePushSubscription(storeId, enablePushPopup);

  // If push notifications are disabled by admin, not supported, or already subscribed, don't show the banner.
  if (!enablePushPopup || !isSupported || isSubscribed) {
    return null;
  }

  return (
    <div className="mt-6 mx-auto max-w-sm bg-primary-50/50 border border-primary-100 rounded-2xl p-3 flex items-center gap-3 animate-in fade-in zoom-in duration-500">
      <div 
        className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white"
        style={{ backgroundColor: primaryColor || "var(--color-primary-500, #2563eb)" }}
      >
        <Bell className="w-5 h-5 animate-pulse" />
      </div>
      <div className="flex-1 text-right">
        <p className="text-sm font-bold text-surface-900 leading-tight mb-1">
          فعّل الاشعارات ومتفوتش العروض الجديدة!
        </p>
        <button
          onClick={handleSubscribe}
          className="text-xs font-bold py-1.5 px-4 rounded-lg text-white transition-opacity hover:opacity-90 mt-1 inline-block"
          style={{ backgroundColor: primaryColor || "var(--color-primary-600, #2563eb)" }}
        >
          اشتراك الآن
        </button>
      </div>
    </div>
  );
}
