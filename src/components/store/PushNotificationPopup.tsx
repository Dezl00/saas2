"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import toast from "react-hot-toast";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface PushNotificationPopupProps {
  storeId: string;
  enablePushPopup: boolean;
  primaryColor?: string;
}

export function PushNotificationPopup({ storeId, enablePushPopup, primaryColor }: PushNotificationPopupProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(true); // Default to true to prevent flash

  useEffect(() => {
    if (!enablePushPopup) return;

    // Check if notifications are supported
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      return;
    }

    // Register service worker if not already
    navigator.serviceWorker.register("/sw.js").catch(console.error);

    // Check existing permission/subscription
    if (Notification.permission === "granted") {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          if (!subscription) {
            setIsSubscribed(false);
          }
        });
      });
    } else if (Notification.permission !== "denied") {
      setIsSubscribed(false);
    }

    // Show popup after 10 seconds if not subscribed
    const timer = setTimeout(() => {
      if (!isSubscribed && Notification.permission !== "denied") {
        const hasDismissed = localStorage.getItem(`push_dismissed_${storeId}`);
        if (!hasDismissed) {
          setShowPopup(true);
        }
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [enablePushPopup, isSubscribed, storeId]);

  const handleSubscribe = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const registration = await navigator.serviceWorker.ready;
        const response = await fetch("/api/push/vapid-public-key");
        const { publicKey } = await response.json();

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });

        // Send to backend
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription,
            storeId,
          }),
        });

        setIsSubscribed(true);
        setShowPopup(false);
        toast.success("تم تفعيل الإشعارات بنجاح");
      } else {
        toast.error("تم رفض الإذن بالإشعارات");
        setShowPopup(false);
        localStorage.setItem(`push_dismissed_${storeId}`, "true");
      }
    } catch (error) {
      console.error("Error subscribing to push notifications", error);
      toast.error("حدث خطأ أثناء تفعيل الإشعارات");
    }
  };

  const handleDismiss = () => {
    setShowPopup(false);
    localStorage.setItem(`push_dismissed_${storeId}`, "true");
  };

  if (!showPopup) return null;

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
              onClick={handleSubscribe}
              className="flex-1 text-white text-xs font-bold py-2 px-3 rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: primaryColor || "var(--color-primary-500, #2563eb)" }}
            >
              تفعيل الاشعارات
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-xs font-medium text-surface-500 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors"
            >
              لاحقاً
            </button>
          </div>
        </div>
        <button 
          onClick={handleDismiss}
          className="text-surface-400 hover:text-surface-600 transition-colors absolute top-3 left-3"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
