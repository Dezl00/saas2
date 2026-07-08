export function TableSkeleton() {
  return (
    <div className="space-y-6 w-full animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-8 bg-surface-200 rounded w-1/4"></div>
        <div className="h-10 bg-surface-200 rounded-[24px] w-32"></div>
      </div>
      
      <div className="bg-white border border-surface-200 rounded-[24px] overflow-hidden">
        <div className="h-12 bg-surface-50 border-b border-surface-100 w-full"></div>
        <div className="p-4 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex justify-between items-center py-2">
              <div className="h-4 bg-surface-100 rounded w-1/4"></div>
              <div className="h-4 bg-surface-100 rounded w-1/6"></div>
              <div className="h-4 bg-surface-100 rounded w-1/5"></div>
              <div className="h-8 bg-surface-100 rounded-lg w-16"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
