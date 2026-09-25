export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-bone mb-4 md:mb-5" />
      <div className="h-3 bg-bone mb-2 w-1/3" />
      <div className="h-4 bg-bone mb-2 w-3/4" />
      <div className="h-3 bg-bone w-1/4" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-bone mb-4 md:mb-5" />
      <div className="h-5 bg-bone mb-2 w-3/4" />
      <div className="h-3 bg-bone w-1/2" />
    </div>
  );
}