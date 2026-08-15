export default function CatalogLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse mt-6">
      {/* Search and Filter Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="h-12 bg-surface-100 rounded-[20px] w-full md:w-1/3 border border-surface-200/50"></div>
        <div className="flex gap-2">
          <div className="h-12 bg-surface-200 rounded-[20px] w-24"></div>
          <div className="h-12 bg-primary-200 rounded-[20px] w-32"></div>
        </div>
      </div>
      
      {/* Table/List Skeleton */}
      <div className="bg-surface-50 rounded-[24px] border border-surface-200 p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-[20px]">
            <div className="w-16 h-16 bg-surface-200 rounded-[16px] flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-surface-200 rounded-lg w-1/3"></div>
              <div className="h-4 bg-surface-100 rounded-lg w-1/4"></div>
            </div>
            <div className="w-20 h-8 bg-surface-100 rounded-lg"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
