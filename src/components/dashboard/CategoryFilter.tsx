"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

type CategoryType = {
  id: string;
  name: string;
};

export function CategoryFilter({ categories }: { categories: CategoryType[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "all";

  const handleChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams);
    if (categoryId === "all") {
      params.delete("category");
    } else {
      params.set("category", categoryId);
    }
    params.delete("page"); // Reset page when filtering
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3 bg-white p-2 rounded-[20px] border-2 border-surface-100 shadow-sm">
      <div className="w-10 h-10 flex items-center justify-center bg-surface-50 rounded-[14px]">
        <Filter className="w-5 h-5 text-surface-500" />
      </div>
      <select
        value={currentCategory}
        onChange={(e) => handleChange(e.target.value)}
        className="pe-8 py-2 bg-transparent text-sm font-bold text-surface-900 outline-none cursor-pointer border-none focus:ring-0"
      >
        <option value="all">جميع الأقسام</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
