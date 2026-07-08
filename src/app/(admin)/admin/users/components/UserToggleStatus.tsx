"use client";

import { useOptimistic, useTransition } from "react";
import { toggleUserStatus } from "../actions/toggle-user-status";

interface Props {
  userId: string;
  status: "ACTIVE" | "SUSPENDED";
}

export function UserToggleStatus({ userId, status }: Props) {
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, addOptimisticStatus] = useOptimistic(
    status,
    (state: string, newStatus: string) => newStatus as "ACTIVE" | "SUSPENDED"
  );

  const isActive = optimisticStatus === "ACTIVE";

  const handleToggle = () => {
    const newStatus = isActive ? "suspend" : "activate";
    startTransition(async () => {
      addOptimisticStatus(isActive ? "SUSPENDED" : "ACTIVE");
      await toggleUserStatus(userId, newStatus);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 ${
        isActive ? "bg-green-500" : "bg-red-500"
      }`}
      dir="ltr"
      title={isActive ? "إيقاف حساب المستخدم" : "تنشيط حساب المستخدم"}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          isActive ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
