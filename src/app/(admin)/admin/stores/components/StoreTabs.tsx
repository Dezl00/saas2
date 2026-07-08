"use client";

import Link from "next/link";
import { Store, CheckCircle, AlertTriangle, Trash2 } from "lucide-react";

export function StoreTabs({ currentStatus }: { currentStatus?: string }) {
  const tabs = [
    { label: "الكل", value: "", icon: Store, activeColor: "bg-surface-950 text-white" },
    { label: "نشط", value: "ACTIVE", icon: CheckCircle, activeColor: "bg-green-600 text-white" },
    { label: "موقوف", value: "SUSPENDED", icon: AlertTriangle, activeColor: "bg-red-600 text-white" },
    { label: "محذوف", value: "DELETED", icon: Trash2, activeColor: "bg-surface-800 text-white" },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map((tab) => {
        const isActive = (currentStatus || "") === tab.value;
        return (
          <Link
            key={tab.value}
            href={`/admin/stores${tab.value ? `?status=${tab.value}` : ""}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-[24px] text-sm font-medium whitespace-nowrap transition-colors border ${
              isActive
                ? `${tab.activeColor} border-transparent`
                : "bg-white text-surface-600 border-surface-200 hover:bg-surface-50"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
