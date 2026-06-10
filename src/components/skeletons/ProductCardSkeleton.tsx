export default function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border overflow-hidden flex flex-col">
      {/* Image */}
      <div className="h-48 skeleton-shimmer" />

      <div className="p-3 flex flex-col flex-1 gap-2">
        {/* Category badge */}
        <div className="h-3 w-16 rounded-full skeleton-shimmer" />
        {/* Title */}
        <div className="h-4 w-full rounded skeleton-shimmer" />
        <div className="h-4 w-3/4 rounded skeleton-shimmer" />
        {/* Stars */}
        <div className="h-3 w-20 rounded skeleton-shimmer mt-1" />
        {/* Price */}
        <div className="h-5 w-24 rounded skeleton-shimmer mt-auto mb-1" />
        {/* Qty + button */}
        <div className="flex gap-2 mt-1">
          <div className="h-8 w-24 rounded-btn skeleton-shimmer" />
          <div className="h-8 flex-1 rounded-btn skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
