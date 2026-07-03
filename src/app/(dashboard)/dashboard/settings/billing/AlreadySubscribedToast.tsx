"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export function AlreadySubscribedToast() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("already") === "true") {
      toast("أنت مشترك بالفعل في هذه الباقة", {
        icon: "ℹ️",
        duration: 4000,
      });
      // Clean the URL
      window.history.replaceState({}, "", "/dashboard/billing");
    }
  }, [searchParams]);

  return null;
}
