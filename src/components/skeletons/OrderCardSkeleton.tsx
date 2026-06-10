export default function OrderCardSkeleton() {
  return (
    <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border overflow-hidden p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="flex gap-2">
            <div className="h-4 w-28 rounded skeleton-shimmer" />
            <div className="h-4 w-20 rounded-full skeleton-shimmer" />
          </div>
          <div className="flex gap-3">
            <div className="h-3 w-24 rounded skeleton-shimmer" />
            <div className="h-3 w-16 rounded skeleton-shimmer" />
          </div>
        </div>
        <div className="space-y-1 shrink-0 text-right">
          <div className="h-5 w-20 rounded skeleton-shimmer ml-auto" />
          <div className="h-3 w-12 rounded skeleton-shimmer ml-auto" />
        </div>
      </div>
      {/* Timeline placeholder */}
      <div className="flex items-center gap-1 pt-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="w-7 h-7 rounded-full skeleton-shimmer shrink-0" />
            {i < 4 && <div className="flex-1 h-0.5 skeleton-shimmer mx-0.5" />}
          </div>
        ))}
      </div>
    </div>
  );
}
