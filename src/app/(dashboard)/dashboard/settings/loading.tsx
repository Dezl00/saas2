export default function Loading() {
  return (
    <div className="space-y-6 w-full max-w-4xl animate-pulse">
      <div className="h-8 bg-surface-200 rounded w-1/4"></div>
      
      <div className="bg-white border border-surface-200 rounded-[24px] p-6 space-y-6">
        <div className="flex items-center gap-4 border-b border-surface-100 pb-4">
          <div className="w-20 h-20 bg-surface-200 rounded-full"></div>
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-surface-200 rounded w-1/3"></div>
            <div className="h-4 bg-surface-100 rounded w-1/4"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-surface-200 rounded w-1/4"></div>
              <div className="h-12 bg-surface-100 rounded-[24px] w-full"></div>
            </div>
          ))}
        </div>
        
        <div className="pt-4 flex justify-end">
          <div className="h-10 bg-primary-200 rounded-[24px] w-32"></div>
        </div>
      </div>
    </div>
  );
}
