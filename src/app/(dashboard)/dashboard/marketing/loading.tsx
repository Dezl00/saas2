export default function MarketingLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse mt-6">
      {/* Header section skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-6 bg-surface-200 rounded-lg w-1/4"></div>
        <div className="h-10 bg-surface-200 rounded-[14px] w-32"></div>
      </div>
      
      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-40 bg-surface-100 rounded-[24px] border border-surface-200/50"></div>
        ))}
      </div>
    </div>
  );
}
