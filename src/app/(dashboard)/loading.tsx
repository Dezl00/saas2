export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse p-4 md:p-8">
      {/* Header Skeleton */}
      <div className="h-8 bg-surface-200 rounded w-1/4 mb-8"></div>
      
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-surface-200 rounded-[24px] p-6 h-32">
            <div className="flex justify-between items-start mb-4">
              <div className="h-4 bg-surface-200 rounded w-1/2"></div>
              <div className="w-10 h-10 bg-surface-200 rounded-[24px]"></div>
            </div>
            <div className="h-6 bg-surface-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
      
      {/* Content Area Skeleton */}
      <div className="bg-white rounded-[24px] border border-surface-200 p-6 h-96">
        <div className="h-6 bg-surface-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-surface-100 rounded w-full"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
