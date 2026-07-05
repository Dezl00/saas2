"use client";

import { Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function MenuItemEditButton({ itemId }: { itemId: string }) {
  const router = useRouter();

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        router.push(`?edit=${itemId}`);
      }}
      title="تعديل"
      className="p-2 text-surface-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
    >
      <Edit2 className="w-4 h-4" />
    </button>
  );
}
