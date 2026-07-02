"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

export function urlBase64ToUint8Array(base64String: string) {
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

export function usePushSubscription(storeId: string, enablePushPopup: boolean) {
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [isDismissed, setIsDismissed] = useState(true);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (!enablePushPopup) return;

    const isPushSupported = "Notification" in window && "serviceWorker" in navigator;
    setIsSupported(true); // Always show the UI, handle unsupported in click handler

    const hasDismissed = localStorage.getItem(`push_dismissed_${storeId}`);
    if (!hasDismissed) {
      setIsDismissed(false);
    }

    if (!isPushSupported) {
      setIsSubscribed(false);
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(console.error);

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
  }, [enablePushPopup, storeId]);

  const handleSubscribe = useCallback(async () => {
    try {
      if (!("Notification" in window) || !("serviceWorker" in navigator)) {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        if (isIOS) {
          toast("لتفعيل الإشعارات على الآيفون، يرجى إضافة الموقع للشاشة الرئيسية (Add to Home Screen) من خيارات المشاركة", { icon: "📱", duration: 6000 });
        } else {
          toast.error("متصفحك لا يدعم الإشعارات");
        }
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const registration = await navigator.serviceWorker.ready;
        const response = await fetch("/api/push/vapid-public-key");
        const { publicKey } = await response.json();

        if (!publicKey) {
          throw new Error("VAPID public key is not configured. Please add NEXT_PUBLIC_VAPID_PUBLIC_KEY to your environment variables.");
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });

        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription,
            storeId,
          }),
        });

        setIsSubscribed(true);
        setIsDismissed(true);
        toast.success("تم تفعيل الإشعارات بنجاح");
      } else {
        toast.error("تم رفض الإذن بالإشعارات");
        setIsDismissed(true);
        localStorage.setItem(`push_dismissed_${storeId}`, "true");
      }
    } catch (error) {
      console.error("Error subscribing to push notifications", error);
      toast.error("حدث خطأ أثناء تفعيل الإشعارات");
    }
  }, [storeId]);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    localStorage.setItem(`push_dismissed_${storeId}`, "true");
  }, [storeId]);

  return { isSubscribed, isDismissed, isSupported, handleSubscribe, handleDismiss };
}
