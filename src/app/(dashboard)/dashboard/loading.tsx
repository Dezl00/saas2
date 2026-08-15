import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="w-full space-y-8 animate-pulse p-2">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-3 mb-8">
        <div className="h-9 bg-surface-200 rounded-xl w-64"></div>
        <div className="h-5 bg-surface-100 rounded-lg w-96 max-w-full"></div>
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="h-64 bg-surface-100 rounded-[24px] border border-surface-200/50"></div>
          <div className="h-40 bg-surface-100 rounded-[24px] border border-surface-200/50"></div>
        </div>
        <div className="space-y-6">
          <div className="h-32 bg-surface-100 rounded-[24px] border border-surface-200/50"></div>
          <div className="h-32 bg-surface-100 rounded-[24px] border border-surface-200/50"></div>
          <div className="h-32 bg-surface-100 rounded-[24px] border border-surface-200/50"></div>
        </div>
      </div>
    </div>
  );
}
