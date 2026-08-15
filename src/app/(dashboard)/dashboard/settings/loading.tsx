export default function SettingsLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="h-6 bg-surface-200 rounded-lg w-1/3"></div>
          <div className="h-14 bg-surface-100 rounded-2xl w-full border border-surface-200/50"></div>
          <div className="h-14 bg-surface-100 rounded-2xl w-full border border-surface-200/50"></div>
        </div>
        <div className="space-y-4">
          <div className="h-6 bg-surface-200 rounded-lg w-1/4"></div>
          <div className="h-32 bg-surface-100 rounded-[24px] w-full border border-surface-200/50"></div>
        </div>
      </div>
      <div className="h-px w-full bg-surface-100 my-8"></div>
      <div className="h-48 bg-surface-100 rounded-[24px] w-full border border-surface-200/50"></div>
    </div>
  );
}
