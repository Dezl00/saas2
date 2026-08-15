export default function OrdersLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse mt-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 bg-surface-200 rounded-lg w-1/4"></div>
        <div className="flex gap-2">
          <div className="h-10 bg-surface-100 rounded-[14px] w-24"></div>
          <div className="h-10 bg-surface-100 rounded-[14px] w-24"></div>
        </div>
      </div>
      
      {/* Cards/List Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-[24px] border border-surface-200 p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="h-6 bg-surface-200 rounded-lg w-20"></div>
              <div className="h-6 bg-surface-100 rounded-full w-16"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-surface-100 rounded-lg w-full"></div>
              <div className="h-4 bg-surface-100 rounded-lg w-3/4"></div>
            </div>
            <div className="pt-4 border-t border-surface-100 flex justify-between items-center">
              <div className="h-6 bg-surface-200 rounded-lg w-16"></div>
              <div className="h-8 bg-primary-100 rounded-lg w-20"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
